import { useCallback, useEffect, useState } from "react";

import { MusicPlayer, SoundPlayer } from "./components/GameMusic";
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
  const [isOpenResultMenu, setIsOpenResultMenu] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isBootLoading, setIsBootLoading] = useState(true);
  const [audioUnlockVersion, setAudioUnlockVersion] = useState(0);
  const [hasAudioGesture, setHasAudioGesture] = useState(false);
  const [roundId, setRoundId] = useState<number | null>(null);
  const [isRoundRunning, setIsRoundRunning] = useState(false);
  const [roundTime, setRoundTime] = useState(0)
  const openResultMenu = () => setIsOpenResultMenu(true);
  const closeResultMenu = () => setIsOpenResultMenu(false);
  const {
    createRound,
    isMusicEnabled,
    isSoundEnabled,
    isMusicSettingLoading,
    isSoundSettingLoading,
    setMusicEnabled,
    setSoundEnabled,
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

  const attemptStartRound = useCallback(async () => {
    try {
      const res = await createRound();

      if (res?.remaining_seconds >= 37 || res?.remaining_seconds < 7) {
        return false;
      }
      setRoundTime(res?.remaining_seconds + 3)
      setRoundId(res.round_no);
      setIsRoundRunning(true);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, [createRound]);

  const handleRoundFinished = useCallback(() => {
    setRoundId(null);
    setIsRoundRunning(false);
    void attemptStartRound();
  }, [attemptStartRound]);

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
          createRound(),
          bootstrapGameStore({ resetPendingBalanceDeduction: true }),
        ]);
        if (cancelled) {
          return;
        }


        if (res.remaining_seconds >= 37 || res?.remaining_seconds < 7) {
          setRoundId(null);
          setIsRoundRunning(false);
        } else {
          setRoundId(res?.round_no);
          setIsRoundRunning(true);
          setRoundTime(res?.remaining_seconds + 3)
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
  }, [createRound]);

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
      <SoundPlayer
        isSoundPlaying={!isSoundSettingLoading && isSoundEnabled}
        isOpenResultMenu={isOpenResultMenu}
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
            onOpenResultMenu={openResultMenu}
            onCloseResultMenu={closeResultMenu}
            isMusicPlaying={isMusicEnabled}
            isSoundPlaying={isSoundEnabled}
            onToggleMusic={() => {
              void setMusicEnabled(!isMusicEnabled);
            }}
            onToggleSound={() => {
              void setSoundEnabled(!isSoundEnabled);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
