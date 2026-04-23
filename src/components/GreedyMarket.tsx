import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useGame } from "../hooks/useGameHook";
import CoinBoard from "./CoinBoard";
import CupMenu from "./CupMenu";
import HelpMenu from "./HelpMenu";
import NoteMenu from "./NoteMenu";
import PlayBoard from "./PlayBoard";
import RechargeMenu from "./RechargeMenu";
import ResultMenu from "./ResultMenu";
import TopMenu from "./TopMenu";
import AdvancedModal from "./AdvancedModeModal";
import JackpotMenu from "./Jackpot";
import { GAME_ASSETS, getAssetUrl } from "../config/gameConfig";
type ToggleRowProps = {
  isOn: boolean;
  onBasic: () => void;
  onAdvanced: () => void;
};
const GAME_WIDTH = 402;
const GAME_HEIGHT = 735;

function ToggleRow({ isOn, onBasic, onAdvanced }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex h-[26px] w-[172px] overflow-hidden rounded-full border bg-gradient-to-t bg-black/10 border-[#b4870a]  text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]">
        <button
          type="button"
          onClick={isOn ? onBasic : undefined}
          className={`h-full flex-1 text-[10px] font-bold [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown] leading-none transition ${isOn ? "bg-transparent  " : "bg-gradient-to-t from-[#E09613] to-[#FFDB19] rounded-full"}`}
        >
          Basic
        </button>
        <button
          type="button"
          onClick={isOn ? undefined : onAdvanced}
          className={`h-full flex-1 text-[10px] font-bold [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown] leading-none transition ${isOn ? "bg-gradient-to-t from-[#a02323] to-[#fa7070] rounded-full  " : "bg-transparent text-white "}`}
        >
          Advance
        </button>
      </div>
    </div>
  );
}

export default function GreedyMarket({
  onToggleMusic,
  isMusicPlaying,
  onOpenResultMenu,
  onCloseResultMenu,
  TodaysRoundId,
  isRoundRunning,
  onRoundFinished,
  RoundTime,
}: {
  RoundTime: number;
  onToggleMusic: () => void;
  isMusicPlaying: boolean;
  onOpenResultMenu: () => void;
  onCloseResultMenu: () => void;
  TodaysRoundId: number | null;
  isRoundRunning: boolean;
  onRoundFinished: (finishedRoundId: number | null) => void;
}) {

  const [activeModal, setActiveModal] = useState<string | null>(null);
  // const [repeatRequestId, setRepeatRequestId] = useState(0);
  const [scale, setScale] = useState(1);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const { gameMode, handleGameMode, setGameMode } = useGame();
  const isOverlayOpen = activeModal !== null;
  // const previousRoundTotal = Object.values(previousRoundBets).reduce((sum, amount) => sum + amount, 0);
  // const availableBalance = Number.parseFloat(displayBalance ?? "0");
  // const hasInsufficientBalance = previousRoundTotal > availableBalance;
  // const triggerRepeatBet = () => {
  //   setRepeatRequestId((prev) => prev + 1);
  // };
  useEffect(() => {
    const load = async () => {

      if (!gameMode) {
        await handleGameMode();
        if (gameMode === "basic") setIsAdvancedMode(false);
        else setIsAdvancedMode(true);

      }
    };
    void load();
  }, [handleGameMode, gameMode]);

  useEffect(() => {
    if (gameMode === "basic") {
      setIsAdvancedMode(false);
      return;
    }

    if (gameMode === "advance") {
      setIsAdvancedMode(true);
    }
  }, [gameMode]);


  useEffect(() => {
    if (activeModal === "result") {
      onOpenResultMenu();
    } else {
      onCloseResultMenu();
    }
  }, [activeModal, onCloseResultMenu, onOpenResultMenu]);

  useEffect(() => {
    const updateScale = () => {
      const nextScale = Math.min(
        window.innerWidth / GAME_WIDTH,
        window.innerHeight / GAME_HEIGHT
      );

      setScale(nextScale > 0 ? nextScale : 1);
    };

    updateScale();
    window.addEventListener("resize", updateScale);

    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <div className="fixed inset-0 flex items-end justify-center overflow-hidden ">
      <div
        className="relative"
        style={{
          width: `${GAME_WIDTH * scale}px`,
          height: `${GAME_HEIGHT * scale}px`,
        }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left rounded-t-[20px]"
          style={{
            width: `${GAME_WIDTH}px`,
            height: `${GAME_HEIGHT}px`,
            transform: `scale(${scale})`,
          }}
        >
          <div className="absolute flex -z-100 blur-[3px]">
            {isAdvancedMode ? <img src={getAssetUrl(GAME_ASSETS.advanceBg)} alt="advanced" />
              : <img src={getAssetUrl(GAME_ASSETS.normalBg)} alt="normal" />}
            {isAdvancedMode === false && (
              <div className="absolute inset-0 bg-blue-500/30 mix-blend-normal" />
            )}
          </div>
          <div className="flex justify-between">
            <div className="ml-[13px] mt-[11px]">
              <CoinBoard onOpenModal={(modal) => setActiveModal(modal)} />
            </div>
            <div className="ml-auto mr-4 mt-2.5">
              <TopMenu
                onOpenModal={(modal) => setActiveModal(modal)}
                onToggleMusic={onToggleMusic}
                isMusicPlaying={isMusicPlaying}
              />
            </div>
          </div>
          <div className="absolute w-full top-[40px]">
            <AnimatePresence>
              <motion.button className="absolute flex w-[100px] h-[100px] left-[5px]"
                initial={{ y: 0, }}
                animate={{ y: 3, }}
                transition={{
                  duration: 0.4,
                  repeat: Infinity, // 👈 add this
                  repeatType: "reverse"
                }}
                onClick={() => setActiveModal("cup")}>
                <motion.img src={getAssetUrl(GAME_ASSETS.RotatedInstant)} alt="shine" className="absolute h-[70px] w-[70px] left-[2px] top-[0px]" animate={{ rotate: 360 }}
                  transition={{
                    rotate: { repeat: Infinity, duration: 5, ease: "linear" },
                  }} />
                <img src={getAssetUrl(GAME_ASSETS.trofy)} alt="cup" className="absolute h-[50px] w-[50px] left-[11px] top-[11px]" />
                <span className="absolute font-bold left-[25px] top-[55px] [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown]">99+</span>
              </motion.button>

              <div className="absolute flex top-[20px] left-1/2 -translate-x-1/2">
                <ToggleRow isOn={isAdvancedMode} onAdvanced={() => {
                  void (async () => {
                    await setGameMode(false).then((response) => {
                      if (!response.status) {
                        setRemainingAmount(response.remaining);
                        setActiveModal("advanced");
                      }
                    })
                  })();
                }}
                  onBasic={() => {
                    void (async () => {
                      await setGameMode(true);
                    })();
                  }} />
              </div>
              <motion.button className="absolute flex w-[70px] h-[70px] right-[5px]"
                initial={{ y: 0, }}
                animate={{ y: 3, }}
                transition={{
                  duration: 0.4,
                  repeat: Infinity, // 👈 add this
                  repeatType: "reverse"
                }}
                onClick={() => setActiveModal("jackpot")}>
                <motion.img src={getAssetUrl(GAME_ASSETS.RotatedInstant)} alt="shine" className="absolute h-[70px] w-[70px] " animate={{ rotate: 360 }}
                  transition={{
                    rotate: { repeat: Infinity, duration: 5, ease: "linear" },
                  }} />
                <img src={getAssetUrl(GAME_ASSETS.jackpotCounter)} alt="jackpot" className="absolute h-[70px] w-[70px] scale-x-125" />
                <span className="absolute font-bold left-1/2 -translate-x-1/2 text-[12px] text-[#ffe033] top-[40px] [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown]">12372634910</span>
              </motion.button>
            </AnimatePresence>
          </div>
          <div className="bottom-0 left-0 right-0">
            <PlayBoard
              RoundId={TodaysRoundId}
              RoundTime={RoundTime}
              isRoundRunning={isRoundRunning}
              onRoundFinished={onRoundFinished}
              onOpenModal={(modal) => setActiveModal(modal)}
              isAdvanced={isAdvancedMode}
            // repeatRequestId={repeatRequestId}
            />
          </div>

          <AnimatePresence>
            {isOverlayOpen && (
              <motion.div
                key="modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 z-40 rounded-t-[20px] bg-black/60 "
              />
            )}
            {activeModal === "advanced" && (
              <motion.div
                key={activeModal}
                initial={{ y: GAME_HEIGHT, opacity: 0 }}
                animate={{ y: 100, opacity: 1 }}
                exit={{ y: GAME_HEIGHT, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute z-50 h-[567px] w-[355px] left-[20px]"
              >
                <AdvancedModal remainingAmount={remainingAmount} onCloseAdvanced={() => setActiveModal(null)}
                  onOk={() => {
                    setActiveModal(null);
                  }} />
              </motion.div>
            )}

            {activeModal === "help" && (
              <motion.div
                key={activeModal}
                initial={{ y: GAME_HEIGHT, opacity: 0 }}
                animate={{ y: 100, opacity: 1 }}
                exit={{ y: GAME_HEIGHT, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute z-50 h-[567px] w-[355px] left-[20px]"
              >
                <HelpMenu onCloseHelp={() => setActiveModal(null)} />
              </motion.div>
            )}

            {activeModal === "note" && (
              <motion.div
                key={activeModal}
                initial={{ y: GAME_HEIGHT, opacity: 0 }}
                animate={{ y: 100, opacity: 1 }}
                exit={{ y: GAME_HEIGHT, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute z-50 h-[567px] w-[355px] left-[20px]"
              >
                <NoteMenu
                  onCloseNote={() => setActiveModal(null)}
                  isAdvanced={isAdvancedMode}
                />
              </motion.div>
            )}
            {activeModal === "cup" && (
              <motion.div
                key={activeModal}
                initial={{ y: GAME_HEIGHT, opacity: 0 }}
                animate={{ y: 80, opacity: 1 }}
                exit={{ y: GAME_HEIGHT, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute z-50 h-[596px] w-[374px] left-[15px] "
              >
                <CupMenu
                  onCloseCup={() => setActiveModal(null)}
                  onOpenModal={setActiveModal}
                />
              </motion.div>
            )}
            {activeModal === "result" && (
              <ResultMenu
                start={3}
                onResultTimeUp={() => {
                  setActiveModal(null);
                }}
              />
            )}
            {activeModal === "recharge" && (
              <motion.div
                key={activeModal}
                initial={{ y: GAME_HEIGHT, opacity: 0 }}
                animate={{ y: 550, opacity: 1 }}
                exit={{ y: GAME_HEIGHT, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute z-50 h-[146px] w-[393px]"
              >
                <RechargeMenu onCloseRechargeModal={() => setActiveModal(null)} />
              </motion.div>
            )}
            {activeModal === "jackpot" && (
              <motion.div
                key={activeModal}
                initial={{ y: GAME_HEIGHT, opacity: 0 }}
                animate={{ y: 100, opacity: 1 }}
                exit={{ y: GAME_HEIGHT, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute z-50 h-[567px] w-[355px] left-[20px]"
              >
                <JackpotMenu
                  onCloseJackpot={() => setActiveModal(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div >
  );
}
