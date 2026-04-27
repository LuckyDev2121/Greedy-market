import { useCallback, useEffect, useRef, useState } from "react";

import { fetchGameDetail, type GameDetailsData } from "./api/api";
import { MusicPlayer } from "./components/GameMusic";
import LoadingScreen from "./components/LoadingScrean";
import GreedyMarket from "./components/GreedyMarket";
import { GAME_ASSETS, getAssetUrl } from "./config/gameConfig";
import { useGame, bootstrapGameStore } from "./hooks/useGameHook";

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = img.onerror = () => resolve();
  });
}

async function preloadGameAssets(setProgress: (value: number) => void) {
  const logoSrc = getAssetUrl(GAME_ASSETS.logo);
  await preloadImage(logoSrc);
  setProgress(20);

  const assets = Object.values(GAME_ASSETS)
    .filter((fileName) => fileName !== GAME_ASSETS.logo)
    .map((fileName) => getAssetUrl(fileName));

  if (assets.length === 0) {
    setProgress(100);
    return;
  }

  let loaded = 0;

  await Promise.all(
    assets.map(
      (src) =>
        new Promise<void>((resolve) => {
          preloadImage(src).then(() => {
            loaded += 1;
            setProgress(20 + Math.round((loaded / assets.length) * 80));
            resolve();
          });
        }),
    ),
  );
}

function getGameDetailsAssetUrls(gameDetails: GameDetailsData): string[] {
  const optionAssets = (gameDetails.options ?? []).map((option) => getAssetUrl(option.logo));
  const betAssets = (gameDetails.bet_amounts ?? []).map((betAmount) => getAssetUrl(betAmount.icon));
  const giftBoxBasePath = gameDetails.gift_boxes_asset_base_path ?? "";
  const giftBoxAssets = (gameDetails.gift_boxes ?? []).flatMap((giftBox) => [
    getAssetUrl(`${giftBoxBasePath}${giftBox.box_closed}`),
    getAssetUrl(`${giftBoxBasePath}${giftBox.box_opened}`),
  ]);

  return [...new Set([...optionAssets, ...betAssets, ...giftBoxAssets].filter(Boolean))];
}

async function preloadAssetBatch(
  assetUrls: string[],
  onProgress?: (loaded: number, total: number) => void,
) {
  if (assetUrls.length === 0) {
    onProgress?.(0, 0);
    return;
  }

  let loaded = 0;

  await Promise.all(
    assetUrls.map(async (src) => {
      await preloadImage(src);
      loaded += 1;
      onProgress?.(loaded, assetUrls.length);
    }),
  );
}

function App() {
  type GameMode = "basic" | "advance";
  const [progress, setProgress] = useState(0);
  const [isBootLoading, setIsBootLoading] = useState(true);
  const [audioUnlockVersion, setAudioUnlockVersion] = useState(0);
  const [hasAudioGesture, setHasAudioGesture] = useState(false);
  const [roundId, setRoundId] = useState<number | null>(null);
  const [isRoundRunning, setIsRoundRunning] = useState(false);
  const [roundTime, setRoundTime] = useState(0);
  const isAttemptingRoundRef = useRef(false);
  const activeRoundIdRef = useRef<number | null>(null);
  const {
    createRound,
    gameMode,
    setGameMode,
    isMusicEnabled,
    isSoundEnabled,
    isMusicSettingLoading,
    isSoundSettingLoading,
    setMusicEnabled,
  } = useGame();
  const shouldRequestAudioUnlock =
    !isMusicSettingLoading &&
    !isSoundSettingLoading &&
    (isMusicEnabled || isSoundEnabled) &&
    !hasAudioGesture;

  const handleUnlockAudio = useCallback(() => {
    setHasAudioGesture(true);
    setAudioUnlockVersion((current) => current + 1);
  }, []);

  const isRoundStartable = useCallback((remainingSeconds: number | undefined) => {
    if (remainingSeconds === undefined) {
      return false;
    }

    return remainingSeconds >= 7 && remainingSeconds < 39;
  }, []);

  const applyRoundState = useCallback((nextRoundId: number | null, nextRoundTime: number, running: boolean) => {
    activeRoundIdRef.current = nextRoundId;
    setRoundId(nextRoundId);
    setRoundTime(nextRoundTime);
    setIsRoundRunning(running);
  }, []);

  const attemptStartRound = useCallback(async (mode: GameMode) => {
    if (isAttemptingRoundRef.current) {
      return false;
    }

    isAttemptingRoundRef.current = true;

    try {
      const res = await createRound(mode);
      if (!isRoundStartable(res?.remaining_seconds)) {
        return false;
      }

      if (activeRoundIdRef.current === res.round_no && isRoundRunning) {
        return true;
      }

      applyRoundState(res.round_no, res.remaining_seconds + 3, true);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      isAttemptingRoundRef.current = false;
    }
  }, [applyRoundState, createRound, isRoundRunning, isRoundStartable]);

  const handleRoundFinished = useCallback((finishedRoundId: number | null) => {
    if (finishedRoundId === null || activeRoundIdRef.current !== finishedRoundId) {
      return;
    }

    applyRoundState(null, 0, false);
  }, [applyRoundState]);


  const handleModeAction = useCallback(async (targetMode: GameMode) => {
    if (gameMode === targetMode) {
      return {
        action: "start-round" as const,
        started: await attemptStartRound(targetMode),
      };
    }

    applyRoundState(null, 0, false);

    const response = await setGameMode(targetMode);
    return {
      action: "change-mode" as const,
      response,
    };
  }, [applyRoundState, attemptStartRound, gameMode, setGameMode]);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const updateBootProgress = (
          staticProgress: number,
          dynamicProgress: number,
          hasGameDetails: boolean,
          hasData: boolean,
        ) => {
          const nextProgress = Math.round(
            staticProgress * 0.55 +
            dynamicProgress * 0.2 +
            (hasGameDetails ? 10 : 0) +
            (hasData ? 15 : 0),
          );

          setProgress(Math.min(100, nextProgress));
        };

        let staticProgress = 0;
        let dynamicProgress = 0;
        let hasGameDetails = false;
        let hasData = false;

        const syncProgress = () => {
          if (cancelled) {
            return;
          }

          updateBootProgress(staticProgress, dynamicProgress, hasGameDetails, hasData);
        };

        const gameDetailsPromise = fetchGameDetail().then((gameDetails) => {
          hasGameDetails = true;
          syncProgress();
          return gameDetails;
        });

        const staticAssetsPromise = preloadGameAssets((value) => {
          staticProgress = value;
          syncProgress();
        });

        const dynamicAssetsPromise = gameDetailsPromise.then((gameDetails) =>
          preloadAssetBatch(getGameDetailsAssetUrls(gameDetails), (loaded, total) => {
            dynamicProgress = total === 0 ? 100 : Math.round((loaded / total) * 100);
            syncProgress();
          }),
        );

        const storePromise = gameDetailsPromise.then((gameDetails) =>
          bootstrapGameStore({
            resetPendingBalanceDeduction: true,
            preloadedGameDetail: gameDetails,
          }),
        );

        const [res] = await Promise.all([
          createRound("basic"),
          storePromise.then(() => {
            hasData = true;
            syncProgress();
          }),
          staticAssetsPromise,
          dynamicAssetsPromise,
        ]);
        if (cancelled) {
          return;
        }
        if (!isRoundStartable(res?.remaining_seconds)) {
          applyRoundState(null, 0, false);
        } else {
          applyRoundState(res.round_no, res.remaining_seconds + 3, true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) {
          setProgress(100);
          setIsBootLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [applyRoundState, createRound, isRoundStartable]);

  useEffect(() => {
    if (isBootLoading || isRoundRunning) {
      return;
    }

    const timer = window.setInterval(() => {
      void attemptStartRound(gameMode === "advance" ? "advance" : "basic");
    }, 1000);

    return () => window.clearInterval(timer);
  }, [attemptStartRound, gameMode, isBootLoading, isRoundRunning]);

  return (
    <div className="relative flex min-h-[100dvh] w-full items-end justify-center overflow-hidden">
      <MusicPlayer
        isMusicPlaying={!isMusicSettingLoading && isMusicEnabled}
        unlockVersion={audioUnlockVersion}
      />
      {isBootLoading ? (
        <LoadingScreen
          progress={progress}
          onUnlockAudio={handleUnlockAudio}
          showUnlockHint={shouldRequestAudioUnlock}
        />
      ) : (
        <div
          className="contents"
          onClick={shouldRequestAudioUnlock ? handleUnlockAudio : undefined}
          onTouchStart={shouldRequestAudioUnlock ? handleUnlockAudio : undefined}
        >
          <GreedyMarket
            TodaysRoundId={roundId}
            isRoundRunning={isRoundRunning}
            RoundTime={roundTime}
            onRoundFinished={handleRoundFinished}
            onModeAction={handleModeAction}
            onOpenResultMenu={() => undefined}
            onCloseResultMenu={() => undefined}
            isMusicPlaying={isMusicEnabled}
            onToggleMusic={() => {
              void setMusicEnabled(!isMusicEnabled);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
