import { useEffect, useMemo, useRef, useState } from "react";
import { getAssetUrl, GAME_ASSETS } from "../config/gameConfig";
import ChooseRectangle from "./ChooseRectangle";
import ChooseTimer from "./ChooseTimer";
import ResultTimer from "./ResultTimer"
import GameElements from "./GameElements";
import HiddenTimer from "./HiddenTimer";
import LedTimer from "./LedTimer";
import { useGame, resolveAssetUrl } from "../hooks/useGameHook";
import MovingHand from "./MoveHand";
import RoundStartTimer from "./RoundStartTimer";
type PlayBoardProps = {
    onOpenModal: (modal: string) => void;
    RoundId: number | null;
    isRoundRunning: boolean;
    onRoundFinished: () => void;
    // repeatRequestId: number;
    RoundTime: number;
    isAdvanced: boolean;
};
function formatNumber(num: number): string {
    if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1_000) {
        return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
}
function sumBetMap(betMap: Record<number, number>): number {
    return Object.values(betMap).reduce((sum, amount) => sum + amount, 0);
}

export default function PlayBoard({
    onOpenModal,
    RoundId,
    isRoundRunning,
    onRoundFinished,
    // repeatRequestId,
    RoundTime,
    isAdvanced,
}: PlayBoardProps) {
    const [blockClick, setBlockClick] = useState<"auto" | "none">("none");
    const [showLedTimer, setShowLedTimer] = useState(false);
    const [showChooseTimer, setShowChooseTimer] = useState(false);
    const [showHiddenTimer, setShowHiddenTimer] = useState(false);
    const [showBoardOpacity, setShowBoardOpacity] = useState(false);
    const [showHand, setShowHand] = useState(false);
    const [showChooseRectangle, setShowChooseRectangle] = useState(false);
    const [currentBetAmount, setCurrentBetAmount] = useState(100);
    const [displayedBets, setDisplayedBets] = useState<Record<number, number>>({});
    const [queuedBets, setQueuedBets] = useState<Record<number, number>>({});
    const [hasStartedFinalBetWindow, setHasStartedFinalBetWindow] = useState(false);
    const [ledTime, setLedTime] = useState(0);
    const [chooseTime, setChooseTime] = useState(0);
    const [resultTime, setResultTime] = useState(0);
    const [hiddenTime, setHiddenTime] = useState(0);
    const [showResultTimer, setShowResultTimer] = useState(false);
    const [roundStart, setRoundStart] = useState(false)
    const [board, setBoard] = useState('');
    const [todayWin, setTodayWin] = useState('');
    const [betBoard, setBetBoard] = useState('');
    const [scoreBoard, setScoreBoard] = useState('');
    const [resultBoard, setResultBoard] = useState('');
    const {
        betAmounts,
        options,
        results,
        gameDetails,
        gift_boxes,
        clearCurrentRoundBets,
        placeBet,
        reserveBetBalance,
        releaseBetBalance,
        playerInfo,
        setPreviousRoundBets,
        winToday,
        handleWinToday,
    } = useGame();
    const queuedBetsRef = useRef<Record<number, number>>({});
    const isSendingBetRef = useRef(false);
    const errorTimeoutRef = useRef<number | null>(null);
    const optionMap = useMemo(() => {
        return Object.fromEntries(
            options.map(o => [o.id, o.logo])
        );
    }, [options]);
    const roundKey = RoundId ?? "waiting";
    const playerBalance = Number.parseFloat(playerInfo?.balance ?? "0");
    const currentWinToday = Math.max(0, Number(winToday?.win ?? 0));
    const maxGiftBoxAmount = gift_boxes.reduce((highest, giftBox) => {
        const amount = Number.parseInt(giftBox.amount, 10);
        return Number.isNaN(amount) ? highest : Math.max(highest, amount);
    }, 0);
    const progressBarWidth =
        maxGiftBoxAmount > 0
            ? Math.min((currentWinToday / maxGiftBoxAmount) * 100, 100)
            : 0;


    const getResultOptionLogo = (id: number) =>
        optionMap[id] ? resolveAssetUrl(optionMap[id]) : "";

    useEffect(() => {
        queuedBetsRef.current = queuedBets;
    }, [queuedBets]);

    useEffect(() => {
        return () => {
            if (errorTimeoutRef.current !== null) {
                window.clearTimeout(errorTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const load = async () => {

            if (!winToday) {
                await handleWinToday();
            }
        };
        void load();
    }, [handleWinToday, winToday]);

    useEffect(() => {

        if (RoundTime >= 12) {
            setLedTime(Math.floor(RoundTime) - 11);
            setRoundStart(true);
            setChooseTime(7);
            setResultTime(1);
            setHiddenTime(3);
            setBlockClick("auto");
            setShowChooseTimer(false);
            setShowHiddenTimer(false);
            setShowBoardOpacity(true);
            setShowChooseRectangle(false);
            setDisplayedBets({});
            setQueuedBets({});
            queuedBetsRef.current = {};
            isSendingBetRef.current = false;
            setHasStartedFinalBetWindow(false);
        } else if (RoundTime < 12 && RoundTime >= 5) {
            setLedTime(27);
            setChooseTime(Math.floor(RoundTime) - 4);

            setResultTime(1);
            setHiddenTime(3);
            setBlockClick("none");
            setShowLedTimer(false);
            setShowChooseTimer(true);
            setShowHiddenTimer(false);
            setShowBoardOpacity(true);
            setShowChooseRectangle(true);
            setShowHand(false);
            setDisplayedBets({});
            setQueuedBets({});
            queuedBetsRef.current = {};
            isSendingBetRef.current = false;
            setHasStartedFinalBetWindow(false);
        } else if (RoundTime < 5 && RoundTime >= 4) {
            setLedTime(27);
            setChooseTime(7);
            setResultTime(1);
            setHiddenTime(3);
            setBlockClick("auto");
            setShowLedTimer(true);
            setShowChooseTimer(false);
            setShowHiddenTimer(false);
            setShowBoardOpacity(false);
            setShowChooseRectangle(false);
            setShowHand(true);
            setDisplayedBets({});
            setQueuedBets({});
            queuedBetsRef.current = {};
            isSendingBetRef.current = false;
            setHasStartedFinalBetWindow(false);
            setShowResultTimer(true)
        } else if (RoundTime < 4 && RoundTime >= 1) {
            setLedTime(27);
            setChooseTime(7);
            setResultTime(1);
            setHiddenTime(Math.floor(RoundTime));
            setBlockClick("auto");
            setShowLedTimer(true);
            setShowChooseTimer(false);
            setShowHiddenTimer(true);
            setShowBoardOpacity(false);
            setShowChooseRectangle(false);
            setShowHand(true);
            setDisplayedBets({});
            setQueuedBets({});
            queuedBetsRef.current = {};
            isSendingBetRef.current = false;
            setHasStartedFinalBetWindow(false);
            onOpenModal("result");
            setShowResultTimer(false)
        } else if (RoundTime < 1) {
            setBlockClick("none");
            setShowLedTimer(false);
            setShowChooseTimer(false);
            setShowHiddenTimer(false);
            setShowBoardOpacity(false);
            setShowChooseRectangle(false);
            setShowHand(false);
            setDisplayedBets({});
            setQueuedBets({});
            queuedBetsRef.current = {};
            isSendingBetRef.current = false;
            setHasStartedFinalBetWindow(false);
            return;
        }
    }, [RoundId, isRoundRunning]);
    useEffect(() => {
        if (isRoundRunning && RoundId) {
            clearCurrentRoundBets();
        }
    }, [RoundId, isRoundRunning, clearCurrentRoundBets]);

    const handleBetOption = (optionId: number, amount: number) => {
        if (blockClick === "none" || hasStartedFinalBetWindow) {
            return;
        }

        const queuedTotal = sumBetMap(queuedBetsRef.current);

        if ((playerBalance - queuedTotal) < amount) {
            onOpenModal("recharge");
            return;
        }

        setDisplayedBets((prev) => ({
            ...prev,
            [optionId]: (prev[optionId] ?? 0) + amount,
        }));
        setQueuedBets((prev) => ({
            ...prev,
            [optionId]: (prev[optionId] ?? 0) + amount,
        }));
        reserveBetBalance(amount);
    };

    // useEffect(() => {
    //     if (repeatRequestId === repeatRequestIdRef.current) {
    //         return;
    //     }

    //     repeatRequestIdRef.current = repeatRequestId;

    //     if (blockClick === "none" || hasStartedFinalBetWindow) {
    //         return;
    //     }

    //     applyBetBatch(previousRoundBets);
    // }, [repeatRequestId, blockClick, hasStartedFinalBetWindow, previousRoundBets]);

    useEffect(() => {
        if (!hasStartedFinalBetWindow) {
            return;
        }

        const intervalId = window.setInterval(() => {
            if (isSendingBetRef.current) return;

            const batch = { ...queuedBetsRef.current };

            const hasBets = Object.values(batch).some((amount) => amount > 0);
            if (!hasBets) return;

            //  clear queue immediately
            queuedBetsRef.current = {};
            setQueuedBets({});

            isSendingBetRef.current = true;

            Promise.all(
                Object.entries(batch).map(([optionId, amount]) =>
                    placeBet(Number(optionId), amount)
                )
            )
                .catch(() => {
                    const total = Object.values(batch).reduce((a, b) => a + b, 0);
                    releaseBetBalance(total);
                })
                .finally(() => {
                    isSendingBetRef.current = false;
                });
        }, 30);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [hasStartedFinalBetWindow, placeBet, releaseBetBalance]);

    useEffect(() => {
        if (isAdvanced) {
            setBoard("bg-[#4e4e4e]");
            setTodayWin("bg-[#6F372F] border-[#E92407]");
            setBetBoard("bg-[#D95B48] border-[#E02407]");
            setScoreBoard("bg-[#D95B48] border-[#E02407]");
            setResultBoard("bg-[#D95B48] border-[#E02407]");
            return;
        }

        setBoard("bg-[#2B93CA]");
        setTodayWin("bg-[#0F6095] border-[#1087C6]");
        setBetBoard("bg-[#0F6095] border-[#1087C6]");
        setScoreBoard("bg-[#0F6095] border-[#1087C6]");
        setResultBoard("bg-[#0F6095] border-[#1087C6]");
    }, [isAdvanced]);
    return (
        <div className="absolute z-20 object-contain top-[90px]" style={{ width: "100%", height: "100%" }}>
            <div className="relative inset-0 z-20">
                <img
                    src={getAssetUrl(GAME_ASSETS.middle)}
                    alt="luckyfruit"
                    className="absolute inset-0 left-1/2 top-[90px] z-20 -translate-x-1/2 transform"
                />
                <img src={getAssetUrl(GAME_ASSETS.gameBoard)} className="absolute inset-0 left-1/2 -translate-x-1/2" />
                {showHand && (
                    <MovingHand />
                )}
                <GameElements
                    controlButtons={blockClick}
                    currentBetAmount={currentBetAmount}
                    displayedBets={displayedBets}
                    onBetOption={handleBetOption}
                />
                <div className={`absolute w-[402px] h-[297px] top-[380px]  ${board}`}>
                    <div className="absolute -top-[15px] left-[0px] h-[100px] w-[402px] overflow-hidden">
                        <img
                            src={getAssetUrl(GAME_ASSETS.jhalot)}
                            alt="jhalot"
                            className="absolute inset-0 h-[100px] w-[402px] scale-x-110"
                        />
                    </div>
                    {isAdvanced && (
                        <div className="absolute w-[402px] h-[370px] -top-[1px] inset-0 bg-red-700/80 mix-blend-plus-darker" />
                    )}
                    <div className={`absolute justify-between items-center px-[10px] ${todayWin} flex w-[234px] h-[26px] top-[10px] rounded-full border-[2px]  left-1/2 -translate-x-1/2`}>
                        <span className=" font-blod">TODAY'S WIN</span>
                        <span className="text-yellow-500 font-blod">{winToday?.win}</span>
                    </div>
                    <button className="absolute left-[10px] -top-[60px] h-[70px] w-[70px] z-[50]">
                        <img src={getAssetUrl(GAME_ASSETS.RotatedInstant)} alt="RotatedInstant" className="absolute scale-125" />
                        <img src={getAssetUrl(GAME_ASSETS.veg)} alt="drink" className="absolute h-[70px] w-[70px] " onClick={() => {
                            handleBetOption(20, currentBetAmount);
                            handleBetOption(21, currentBetAmount);
                            handleBetOption(22, currentBetAmount);
                            handleBetOption(23, currentBetAmount);
                        }} />
                    </button>
                    <button className="absolute  right-[10px] -top-[60px] h-[70px] w-[70px] z-[50] ">
                        <img src={getAssetUrl(GAME_ASSETS.RotatedInstant)} alt="RotatedInstant" className="absolute scale-125" />
                        <img src={getAssetUrl(GAME_ASSETS.drink)} alt="veg" className="absolute h-[70px] w-[70px]" onClick={() => {
                            handleBetOption(24, currentBetAmount);
                            handleBetOption(25, currentBetAmount);
                            handleBetOption(26, currentBetAmount);
                            handleBetOption(27, currentBetAmount);
                        }} />
                    </button>
                    <div className={`absolute scrollbar-hidden flex overflow-y-hidden overflow-x-auto w-[345px] h-[100px] ${betBoard} top-[50px] rounded-[20px] border-[5px] left-1/2 -translate-x-1/2`}
                        style={{ pointerEvents: "auto" }}>
                        {betAmounts
                            .filter((element) =>
                                isAdvanced ? element.mode === "advance" : element.mode === "basic"
                            )
                            .map((element) => {
                                const amountValue = Number.parseInt(element.amount, 10);
                                return (
                                    <button
                                        key={element.id}
                                        className="relative h-[80px] w-[80px] shrink-0"
                                        onClick={() => setCurrentBetAmount(amountValue)}
                                    >
                                        {currentBetAmount === amountValue && (
                                            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-[60px] w-[60px] bg-[#ffee8d] blur-[3px] rounded-full"></div>
                                        )}
                                        <img
                                            src={resolveAssetUrl(element.icon)}
                                            alt={`Bet amount ${element.amount}`}
                                            className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pt-0"
                                        />

                                    </button>
                                );
                            })}
                    </div>
                    <div className={`absolute w-[343px] h-[18px] overflow-hidden rounded-[20px] top-[160px] ${scoreBoard}  border-[1px]  left-1/2 -translate-x-1/2`}>
                        <div
                            className={`absolute inset-y-0 left-0 rounded-[20px] ${isAdvanced ? "bg-[#F3A44B]" : "bg-[#FFD24A]"}`}
                            style={{ width: `${progressBarWidth}%` }}
                        />
                    </div >
                    <div className={`absolute w-[343px] h-[18px]  top-[180px] left-1/2 -translate-x-1/2`}>
                        {gift_boxes?.map((element, index) => {
                            const amountValue = Number.parseInt(element.amount, 10);
                            return currentWinToday > amountValue ? (
                                <>
                                    <img
                                        key={index}
                                        src={`${gameDetails?.gift_boxes_asset_base_path}${element.box_opened}`}
                                        alt="box"
                                        className={`absolute left-[${38 + 68 * index}px] -top-[32px]`}
                                    />
                                    <span className={`absolute left-[${48 + 68 * index}px] top-[5px] text-[#f0d457] [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown]`}>{formatNumber(amountValue)}</span>
                                </>
                            ) : (
                                <>
                                    <img
                                        key={index}
                                        src={`${gameDetails?.gift_boxes_asset_base_path}${element.box_closed}`}
                                        alt="box"
                                        className={`absolute left-[${38 + 68 * index}px] -top-[32px]`}
                                    />
                                    <span className={`absolute left-[${48 + 68 * index}px] top-[5px] text-[#f0d457] [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown]`}>{formatNumber(amountValue)}</span>
                                </>
                            );
                        })}
                    </div >
                    <div className={`absolute flex items-center w-[343px] h-[45px] rounded-[12px] ${resultBoard} top-[210px]  border-[2px]  left-1/2 -translate-x-1/2`}>
                        <span className="ml-[10px] text-[16px]">Result</span>
                        <div className="ml-[10px] w-[2px] h-[25px] bg-white/80"></div>
                        <div className="scrollbar-hidden absolute flex  left-[60px] top-[5px] h-[40px] w-[280px] overflow-y-hidden overflow-x-auto z-20  transform">
                            <div className="flex items-center h-full whitespace-nowrap ">
                                {results?.data?.map((result, index) => (
                                    <div key={index} className={`flex-shrink-0 relative h-[30px] w-[30px] mt-[3px] ${results.data?.length === undefined || index === results.data.length - 1 ? "" : "mr-[12px]"
                                        }`}>
                                        {result.is_jackpot === 0 && (
                                            <img
                                                src={getResultOptionLogo(result.option_id)}
                                                alt={result.option_name || `Result ${index + 1}`}
                                                className="absolute inset-0 h-full w-full"
                                            />
                                        )}
                                        {result.is_jackpot === 1 && (
                                            <img
                                                src={getAssetUrl(GAME_ASSETS.drink)}
                                                alt={result.option_name || `Result ${index + 1}`}
                                                className="absolute inset-0 h-full w-full"
                                            />
                                        )}
                                        {result.is_jackpot === 2 && (
                                            <img
                                                src={getAssetUrl(GAME_ASSETS.veg)}
                                                alt={result.option_name || `Result ${index + 1}`}
                                                className="absolute inset-0 h-full w-full"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
                {showBoardOpacity && (
                    <div className="absolute w-[402px] h-[735px] rounded-[20px] inset-0 z-30 bg-[#360149]  opacity-20"></div>
                )}
                {roundStart && (
                    <div>
                        <RoundStartTimer
                            onRoundStartUp={() => {
                                setShowBoardOpacity(false);
                                setRoundStart(false)
                                setShowLedTimer(true);
                                setShowHand(true);
                            }} />
                    </div>
                )}
                {showLedTimer && (
                    <div className="absolute  left-[calc(50%+1px)] top-[198px] z-50 -translate-x-1/2 transform">
                        <LedTimer
                            key={`led-${roundKey}`}
                            start={ledTime}
                            onLedTimeUp={() => {
                                setHasStartedFinalBetWindow(true);
                                setPreviousRoundBets(displayedBets);
                                setShowChooseTimer(true);
                                setShowLedTimer(false);
                                setShowBoardOpacity(false);
                                setBlockClick("none");
                                setShowChooseRectangle(true);
                                setShowHand(false);
                            }}
                        />
                    </div>
                )}
                {showChooseTimer && (
                    <div className="absolute left-[calc(50%+1px)] top-[198px] z-50 -translate-x-1/2 transform">
                        <ChooseTimer
                            key={`choose-${roundKey}`}
                            start={chooseTime}

                            onChooseTimeUp={() => {
                                setShowChooseTimer(false);
                                setShowResultTimer(true)
                                setShowBoardOpacity(false);
                                setShowChooseRectangle(false);
                            }}
                        />
                    </div>
                )}
                {showResultTimer && (
                    <div className='absolute inset-0 z-40'>
                        <ResultTimer
                            start={resultTime}
                            onResultTimeUp={() => {
                                onOpenModal("result");
                                setShowHiddenTimer(true);
                                setShowResultTimer(false)

                            }} />
                    </div>
                )}
                {showHiddenTimer && (
                    <div className="absolute left-1/2 top-[197px] z-30 -translate-x-1/2 transform">
                        <HiddenTimer
                            key={`hidden-${roundKey}`}
                            start={hiddenTime}
                            onHiddenTimeUp={() => {
                                setShowHiddenTimer(false);
                                setShowHand(false);
                                setBlockClick("none");
                                onRoundFinished();
                            }}
                        />
                    </div>
                )}
                {showChooseRectangle && (
                    <div className="absolute inset-0 z-40">
                        <ChooseRectangle
                            RoundId={RoundId}
                            onChooseTimeUp={() => {
                                setShowChooseRectangle(false);
                            }}
                        />
                    </div>
                )}
            </div>
        </div >
    );
}




