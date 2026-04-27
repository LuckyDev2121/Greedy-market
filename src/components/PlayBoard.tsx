import { useEffect, useMemo, useRef, useState } from "react";
import { getAssetUrl, GAME_ASSETS } from "../config/gameConfig";
import { motion } from "framer-motion";
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
    onRoundFinished: (finishedRoundId: number | null) => void;
    // repeatRequestId: number;
    RoundTime: number;
    isAdvanced: boolean;
    giftAmount: (gift: number) => void;
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

function calculateGiftProgress(currentValue: number, thresholds: number[]): number {
    if (thresholds.length === 0) {
        return 0;
    }

    const safeThresholds = thresholds.filter((value) => Number.isFinite(value) && value > 0);
    if (safeThresholds.length === 0) {
        return 0;
    }

    for (let index = 0; index < safeThresholds.length; index += 1) {
        const currentThreshold = safeThresholds[index];
        const previousThreshold = index === 0 ? 0 : safeThresholds[index - 1];
        const segmentStart = index * 20;

        if (currentValue < currentThreshold) {
            const segmentRange = currentThreshold - previousThreshold;
            if (segmentRange <= 0) {
                return segmentStart;
            }

            return segmentStart + ((currentValue - previousThreshold) / segmentRange) * 20;
        }
    }

    return 100;
}

const MAX_BET_OPTIONS_PER_ROUND = 6;

function countSelectedOptions(betMap: Record<number, number>): number {
    return Object.values(betMap).filter((amount) => amount > 0).length;
}

type Point = {
    x: number;
    y: number;
};

type FlyingBet = {
    id: number;
    imageSrc: string;
    start: Point;
    end: Point;
    active: boolean;
};

function getElementCenterWithinContainer(
    container: HTMLElement,
    element: HTMLElement,
): Point {
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const scaleX = container.offsetWidth > 0 ? containerRect.width / container.offsetWidth : 1;
    const scaleY = container.offsetHeight > 0 ? containerRect.height / container.offsetHeight : 1;

    return {
        x: (elementRect.left - containerRect.left + (elementRect.width / 2)) / scaleX,
        y: (elementRect.top - containerRect.top + (elementRect.height / 2)) / scaleY,
    };
}

export default function PlayBoard({
    giftAmount,
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
    const [flyingBets, setFlyingBets] = useState<FlyingBet[]>([]);
    const [optimisticClaimedGiftIds, setOptimisticClaimedGiftIds] = useState<number[]>([]);
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
        displayBalance,
        setPreviousRoundBets,
        winToday,
        handleWinToday,
        handleGetGift,
    } = useGame();
    const displayedBetsRef = useRef<Record<number, number>>({});
    const errorTimeoutRef = useRef<number | null>(null);
    const animationIdRef = useRef(0);
    const boardRef = useRef<HTMLDivElement | null>(null);
    const currentBetButtonRef = useRef<HTMLButtonElement | null>(null);
    const vegButtonRef = useRef<HTMLImageElement | null>(null);
    const drinkButtonRef = useRef<HTMLImageElement | null>(null);
    const optionButtonRefs = useRef<Record<number, HTMLButtonElement | null>>({});
    const initializedRoundRef = useRef<number | null>(null);
    const optionMap = useMemo(() => {
        return Object.fromEntries(
            options.map(o => [o.id, o.logo])
        );
    }, [options]);
    const roundKey = RoundId ?? "waiting";
    const playerBalance = Number.parseFloat(displayBalance ?? playerInfo?.balance ?? "0");
    const currentWinTodayBasic = Math.max(0, Number(winToday?.win ?? 0));
    const currentWinTodayAdvance = Math.max(0, Number(winToday?.win2 ?? 0));
    const activeMode = isAdvanced ? "advance" : "basic";
    const modeGiftBoxes = useMemo(
        () =>
            gift_boxes
                .filter((box) => box.mode === activeMode)
                .map((box) => ({
                    ...box,
                    box_closed: box.box_closed.trim(),
                    box_opened: box.box_opened.trim(),
                    is_claimed:
                        box.is_claimed === true ||
                        box.is_claimed === "true" ||
                        box.is_claimed === 1 ||
                        box.is_claimed === "1",
                }))
                .sort((left, right) => Number.parseFloat(left.amount) - Number.parseFloat(right.amount))
                .slice(0, 5),
        [activeMode, gift_boxes],
    );
    const currentWinToday = isAdvanced ? currentWinTodayAdvance : currentWinTodayBasic;
    const giftBoxThresholds = modeGiftBoxes.map((box) => Number.parseFloat(box.amount));
    const progressBarWidth = calculateGiftProgress(currentWinToday, giftBoxThresholds);
    const giftBoxPositions = [38, 106, 174, 242, 310];
    const giftBoxGlowPositions = giftBoxPositions.map((position) => position - 6);
    const claimedGiftIds = useMemo(
        () => new Set([
            ...gift_boxes.filter((box) => box.is_claimed).map((box) => box.id),
            ...optimisticClaimedGiftIds,
        ]),
        [gift_boxes, optimisticClaimedGiftIds],
    );


    const getResultOptionLogo = (id: number) =>
        optionMap[id] ? resolveAssetUrl(optionMap[id]) : "";

    const currentBetImageSrc = useMemo(() => {
        const selectedBetAmount = betAmounts.find((element) => Number.parseInt(element.amount, 10) === currentBetAmount);
        return selectedBetAmount ? resolveAssetUrl(selectedBetAmount.icon) : "";
    }, [betAmounts, currentBetAmount]);

    const registerOptionRef = (optionId: number, element: HTMLButtonElement | null) => {
        optionButtonRefs.current[optionId] = element;
    };

    const markGiftAsClaimed = (giftId: number) => {
        setOptimisticClaimedGiftIds((prev) => prev.includes(giftId) ? prev : [...prev, giftId]);
    };

    const handleClaimGift = async (giftId: number) => {
        try {
            const response = await handleGetGift(giftId);
            if (response.status) {
                giftAmount(response.data?.gift_amount ?? 0);
                markGiftAsClaimed(giftId);
                onOpenModal("gift");
                return;
            }

            if (response.message === "Gift already claimed") {
                markGiftAsClaimed(giftId);
            }

            console.warn("Gift claim rejected:", response.message ?? "Unknown reason");
        } catch (error) {
            console.error("Failed to claim gift", error);
        }
    };

    const startBetFlight = (startElement: HTMLElement | null, optionId: number) => {
        const boardElement = boardRef.current;
        const targetElement = optionButtonRefs.current[optionId];

        if (!boardElement || !startElement || !targetElement || !currentBetImageSrc) {
            return;
        }

        const start = getElementCenterWithinContainer(boardElement, startElement);
        const end = getElementCenterWithinContainer(boardElement, targetElement);
        const animationId = animationIdRef.current++;

        setFlyingBets((prev) => [
            ...prev,
            {
                id: animationId,
                imageSrc: currentBetImageSrc,
                start,
                end,
                active: false,
            },
        ]);

        window.requestAnimationFrame(() => {
            setFlyingBets((prev) => prev.map((item) => item.id === animationId ? { ...item, active: true } : item));
        });

        window.setTimeout(() => {
            setFlyingBets((prev) => prev.filter((item) => item.id !== animationId));
        }, 220);
    };

    useEffect(() => {
        const matched = betAmounts.find((element) =>
            isAdvanced ? element.mode === "advance" : element.mode === "basic"
        );

        if (!matched) return;

        setCurrentBetAmount(Number.parseInt(matched.amount, 10));
    }, [isAdvanced,]);

    useEffect(() => {
        displayedBetsRef.current = displayedBets;
    }, [displayedBets]);

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
        if (isRoundRunning) {
            return;
        }

        setRoundStart(false);
        setShowLedTimer(false);
        setShowChooseTimer(false);
        setShowHiddenTimer(false);
        setShowResultTimer(false);
        setShowChooseRectangle(false);
        setShowBoardOpacity(false);
        setShowHand(false);
        setBlockClick("none");
    }, [isRoundRunning]);

    useEffect(() => {
        if (!isRoundRunning || RoundId === null) {
            initializedRoundRef.current = null;
            return;
        }

        if (initializedRoundRef.current === RoundId) {
            return;
        }

        initializedRoundRef.current = RoundId;

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
            setFlyingBets([]);
            displayedBetsRef.current = {};
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
            setFlyingBets([]);
            displayedBetsRef.current = {};
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
            setFlyingBets([]);
            displayedBetsRef.current = {};
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
            setFlyingBets([]);
            displayedBetsRef.current = {};
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
            setFlyingBets([]);
            displayedBetsRef.current = {};
            setHasStartedFinalBetWindow(false);
            return;
        }
    }, [RoundId, RoundTime, isRoundRunning, onOpenModal]);
    useEffect(() => {
        if (isRoundRunning && RoundId) {
            clearCurrentRoundBets();
        }
    }, [RoundId, isRoundRunning, clearCurrentRoundBets]);

    const handleBetOption = async (optionId: number, amount: number, startElement: HTMLElement | null) => {
        if (blockClick === "none" || hasStartedFinalBetWindow) {
            return false;
        }

        const displayedTotal = sumBetMap(displayedBetsRef.current);

        if ((playerBalance - displayedTotal) < amount) {
            onOpenModal("recharge");
            return false;
        }

        const isNewOption = (displayedBetsRef.current[optionId] ?? 0) <= 0;
        if (isNewOption && countSelectedOptions(displayedBetsRef.current) >= MAX_BET_OPTIONS_PER_ROUND) {
            return false;
        }

        const nextDisplayedBets = {
            ...displayedBetsRef.current,
            [optionId]: (displayedBetsRef.current[optionId] ?? 0) + amount,
        };

        displayedBetsRef.current = nextDisplayedBets;
        setDisplayedBets(nextDisplayedBets);
        reserveBetBalance(amount);
        startBetFlight(startElement, optionId);

        try {
            await placeBet(optionId, amount, isAdvanced);
            return true;
        } catch (error) {
            console.error("Failed to place bet", error);
            const revertedDisplayedBets = {
                ...displayedBetsRef.current,
                [optionId]: Math.max(0, (displayedBetsRef.current[optionId] ?? 0) - amount),
            };

            if (revertedDisplayedBets[optionId] === 0) {
                delete revertedDisplayedBets[optionId];
            }

            displayedBetsRef.current = revertedDisplayedBets;
            setDisplayedBets(revertedDisplayedBets);
            releaseBetBalance(amount);
            return false;
        }
    };

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
            <div ref={boardRef} className="relative inset-0 z-20">
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
                    onBetOption={(optionId, amount) => {
                        void handleBetOption(optionId, amount, currentBetButtonRef.current);
                    }}
                    registerOptionRef={registerOptionRef}
                />
                {flyingBets.map((item) => (
                    <img
                        key={item.id}
                        src={item.imageSrc}
                        alt=""
                        aria-hidden="true"
                        className="pointer-events-none absolute z-[60] h-[44px] w-[44px] -translate-x-1/2 -translate-y-1/2"
                        style={{
                            left: item.active ? item.end.x : item.start.x,
                            top: item.active ? item.end.y : item.start.y,
                            opacity: item.active ? 0 : 1,
                            transition: "left 200ms linear, top 200ms linear, opacity 500ms linear",
                        }}
                    />
                ))}
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
                        <span className="text-yellow-500 font-blod">{isAdvanced ? formatNumber(winToday?.win2 ?? 0) : formatNumber(winToday?.win ?? 0)}</span>
                    </div>
                    <button className="absolute left-[10px] -top-[60px] h-[70px] w-[70px] z-[50]">
                        <img src={getAssetUrl(GAME_ASSETS.RotatedInstant)} alt="RotatedInstant" className="absolute scale-125" />
                        <img ref={vegButtonRef} src={getAssetUrl(GAME_ASSETS.veg)} alt="drink" className="absolute h-[70px] w-[70px] " onClick={() => {
                            [20, 21, 22, 23].forEach((optionId) => {
                                if (handleBetOption(optionId, currentBetAmount)) {
                                    startBetFlight(vegButtonRef.current, optionId);
                                }
                            });
                        }} />
                    </button>
                    <button className="absolute  right-[10px] -top-[60px] h-[70px] w-[70px] z-[50] ">
                        <img src={getAssetUrl(GAME_ASSETS.RotatedInstant)} alt="RotatedInstant" className="absolute scale-125" />
                        <img ref={drinkButtonRef} src={getAssetUrl(GAME_ASSETS.drink)} alt="veg" className="absolute h-[70px] w-[70px]" onClick={() => {
                            [24, 25, 26, 27].forEach((optionId) => {
                                if (handleBetOption(optionId, currentBetAmount)) {
                                    startBetFlight(drinkButtonRef.current, optionId);
                                }
                            });
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
                                        ref={currentBetAmount === amountValue ? currentBetButtonRef : undefined}
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
                            className="absolute inset-y-0 left-0 rounded-[20px] bg-gradient-to-t from-[#118D11] to-[#1EF31E]"
                            style={{ width: `${progressBarWidth}%` }}
                        />
                    </div >
                    <div className={`absolute w-[343px] h-[18px] top-[140px] left-1/2 -translate-x-1/2`}>
                        {modeGiftBoxes.map((element, index) => {
                            const amountValue = Number.parseFloat(element.amount);
                            // const isClaimed = element.is_claimed || claimedGiftIds.has(element.id);
                            const isUnlocked = currentWinToday >= amountValue;
                            const boxLeft = giftBoxPositions[index] ?? giftBoxPositions[0];
                            const glowLeft = giftBoxGlowPositions[index] ?? giftBoxGlowPositions[0];
                            const labelLeft = boxLeft + 10;
                            // const boxImageName = isClaimed ? element.box_opened : element.box_closed;
                            // const boxImageSrc = `${gameDetails?.gift_boxes_asset_base_path ?? ""}${boxImageName}`;

                            return (
                                <div key={`${activeMode}-${element.id}`} className="contents">
                                    {isUnlocked ? (
                                        < button
                                            type="button"
                                            className="absolute top-[0px] h-[60px] w-[60px] bg-transparent"
                                            style={{ left: `${glowLeft}px` }}
                                            onClick={() => {
                                                void handleClaimGift(element.id);
                                            }}
                                        >
                                            <motion.img
                                                src={getAssetUrl(GAME_ASSETS.RotatedInstant)}
                                                alt="RotatedInstant"
                                                className="absolute top-[0px] w-[60px]"
                                                style={{ left: "0px" }}
                                                animate={{ rotate: 360 }}
                                                transition={{
                                                    rotate: { repeat: Infinity, duration: 5, ease: "linear" },
                                                }}
                                            />
                                            {element.is_claimed ? (
                                                <img
                                                    src={resolveAssetUrl(element.box_opened)}
                                                    alt="box"
                                                    className="absolute top-[12px]"
                                                    style={{ left: `${boxLeft}px` }}
                                                />
                                            ) : (
                                                <img
                                                    src={resolveAssetUrl(element.box_closed)}
                                                    alt="box"
                                                    className="absolute top-[12px]"
                                                    style={{ left: `${boxLeft}px` }}
                                                />
                                            )}
                                        </button>
                                    ) : <img
                                        src={resolveAssetUrl(element.box_closed)}
                                        alt="box"
                                        className="absolute top-[12px]"
                                        style={{ left: `${boxLeft}px` }}
                                    />}
                                    <span
                                        className="absolute top-[45px] text-[#f0d457] [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown]"
                                        style={{ left: `${labelLeft}px` }}
                                    >
                                        {formatNumber(amountValue)}
                                    </span>
                                </div>
                            );
                        })}
                    </div >
                    <div className={`absolute flex items-center w-[343px] h-[45px] rounded-[12px] ${resultBoard} top-[210px]  border-[2px]  left-1/2 -translate-x-1/2`}>
                        <span className="ml-[10px] text-[16px]">Result</span>
                        <div className="ml-[10px] w-[2px] h-[25px] bg-white/80"></div>
                        <div className=" scrollbar-hidden absolute flex  left-[65px] top-[5px] h-[40px] w-[270px] overflow-y-hidden overflow-x-auto z-20 ">
                            {results?.data?.map((result, index) => (
                                <div key={index} className={`flex-shrink-0 relative h-[30px] w-[30px] left-[6px] mt-[0px] ${results.data?.length === undefined || index === results.data.length - 1 ? "" : "mr-[10px]"
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
                                onRoundFinished(RoundId);
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




