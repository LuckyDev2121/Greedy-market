import { useCallback, useEffect, useRef, useState } from "react";

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

function App() {
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

  const attemptStartRound = useCallback(async () => {
    if (isAttemptingRoundRef.current) {
      return false;
    }

    isAttemptingRoundRef.current = true;

    try {
      const res = await createRound(false);
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

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        await preloadGameAssets(setProgress);
        if (cancelled) {
          return;
        }

        setProgress(85);


        const [res] = await Promise.all([
          createRound(false),
          bootstrapGameStore({ resetPendingBalanceDeduction: true }),
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
      void attemptStartRound();
    }, 1000);

    return () => window.clearInterval(timer);
  }, [attemptStartRound, isBootLoading, isRoundRunning]);

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
