import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getAssetUrl, GAME_ASSETS } from "../config/gameConfig";
import ModalHeaderPlate from "./ModalHeaderPlate";
import ResultMenuDivider from "./ResultMenuDivider";
import { useGame, resolveAssetUrl } from "../hooks/useGameHook";
type ResultMenuProps = {
    start?: number;
    onResultTimeUp?: () => void;
};

function formatDiamondAmount(amount: number): string {
    if (amount >= 1_000_000_000) {
        return `${(amount / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
    }
    if (amount >= 1_000_000) {
        return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (amount >= 1_000) {
        return `${(amount / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
    }

    return amount.toString();
}

export default function ResultMenu({ start, onResultTimeUp }: ResultMenuProps) {
    const [showIcon, setShowIcon] = useState(false);
    const initialTime = Math.max(0, start ?? 0);
    const [time, setTime] = useState(initialTime);
    const onResultTimeUpRef = useRef(onResultTimeUp);
    const { options, makeResult: result, previousRoundBets, refreshGameData, } = useGame();
    const activeResult = result;
    const isJackpot = !!activeResult?.jackpot_avatar;

    const optionMap = useMemo(() => {
        return Object.fromEntries(options.map(o => [o.id, o.logo,]));
    }, [options]);
    const totalBetAmount = useMemo(() => {
        return Object.values(previousRoundBets).reduce(
            (sum, amount) => sum + amount,
            0
        );
    }, [previousRoundBets]);
    const winningDiamondAmount = useMemo(() => {
        if (!activeResult) {
            return 0;
        }
        let total = 0;
        activeResult.winning_option_id.forEach((optionId) => {
            let timer = 0;

            if (optionId < 9) timer = 5;
            else if (optionId === 9) timer = 10;
            else if (optionId === 10) timer = 15;
            else if (optionId === 11) timer = 25;
            else if (optionId === 12) timer = 45;

            const betAmount = previousRoundBets[optionId] ?? 0;

            total += betAmount * timer;
        });

        return total;
    }, [activeResult, previousRoundBets]);


    const resultMessage = useMemo(() => {
        if (totalBetAmount === 0) {
            return "Did not participate in this round";
        }

        if (winningDiamondAmount > 0) {
            return "Congratelations on getting diamonds";
        }

        return "Sorry, didn't win this round";
    }, [totalBetAmount, winningDiamondAmount]);

    const getResultOptionLogo = (optionId: number) => {
        return optionMap[optionId]
            ? resolveAssetUrl(optionMap[optionId])
            : "";
    };

    useEffect(() => {
        void refreshGameData({ resetPendingBalanceDeduction: true });
    }, [refreshGameData]);

    useEffect(() => {
        if (winningDiamondAmount > 0) setShowIcon(true);
        else setShowIcon(false);
    }, [winningDiamondAmount]);

    useEffect(() => {
        setTime(initialTime);
    }, [initialTime]);

    useEffect(() => {
        if (initialTime <= 0) {
            onResultTimeUpRef.current?.();
            return;
        }

        const timer = window.setInterval(() => {
            setTime((prev) => {
                if (prev <= 1) {
                    window.clearInterval(timer);
                    onResultTimeUpRef.current?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => window.clearInterval(timer);
    }, [initialTime]);

    const formatted = String(time).padStart(2, "0");

    return (
        <div className="absolute h-[374px] w-[374px]  top-[300px]">
            <img src={getAssetUrl(GAME_ASSETS.result)} alt="result" className="absolute left-[20px] " />
            {/* <span className="absolute  left-1/2 transform -translate-x-1/2 text-sm font-bold mt-1">Round {activeResult?.round_no} of Today</span>
            <span className="absolute h-[19px] w-[19px] mt-[5px] right-[62px] rounded-full " >
                {formatted}
            </span>
            <div className="absolute left-1/2 top-[57px] h-[117px] w-[117px] -translate-x-1/2 overflow-hidden rounded-full">
                <motion.img
                    src={getAssetUrl(GAME_ASSETS.rotatedInstances)}
                    alt="Shine"
                    className="absolute inset-0 h-full w-full origin-center opacity-50"
                    animate={{ rotate: 360 }}
                    transition={{
                        rotate: { repeat: Infinity, duration: 8, ease: "linear" },
                    }}
                />
            </div>
            {activeResult && (
                isJackpot ? (
                    <img
                        src={resolveAssetUrl(activeResult.jackpot_avatar ?? "")}
                        alt="selectedFruit"
                        className={`absolute left-1/2 -translate-x-1/2 top-[70px] h-[85px] w-[85px]`}
                    />
                )
                    : (
                        <img
                            src={getResultOptionLogo(activeResult.winning_option_id[0])}
                            alt="selectedFruit"
                            className={`absolute left-1/2 -translate-x-1/2 top-[70px] h-[85px] w-[85px]`}
                        />
                    )
            )}
            <div className="absolute left-1/2 top-[191px] flex -translate-x-1/2 items-center justify-center gap-1 whitespace-nowrap">
                <span>{resultMessage}</span>
                {showIcon && (
                    <>
                        <img
                            src={getAssetUrl(GAME_ASSETS.diamondIcon)}
                            alt="Diamond Icon"
                            className="h-[9px] w-[16px]"
                        />
                        <span>{winningDiamondAmount > 0 ? formatDiamondAmount(winningDiamondAmount) : "0"}</span>
                    </>
                )}
            </div>
            <ResultMenuDivider className="absolute left-[61px] top-[221px]" direction="left" />
            <ResultMenuDivider className="absolute left-[281px] top-[221px]" direction="right" />
            <span className="absolute left-1/2 -translate-x-1/2 top-[215px] text-[#FFFFFF]/60">Biggest winning of the round</span>
            <div className="absolute grid grid-cols-3 top-[244px] w-[300px] h-[100px] left-1/2 -translate-x-1/2 ">
                {activeResult?.winners?.[0]?.avater && (
                    <div className="relative h-[100px] w-[100px]">
                        <img src={resolveAssetUrl(activeResult?.winners?.[0]?.avater ?? "")} alt="abatar" className="absolute left-1/2 h-[50px] w-[50px] -translate-x-1/2 rounded-full object-cover" />
                        <span className="absolute top-[50px] w-[100px] text-center">{activeResult?.winners?.[0]?.id ?? "N/A"}</span>
                        <div className="absolute flex top-[70px] w-[100px] items-center justify-center">
                            <div className="relative ">
                                <img src={getAssetUrl(GAME_ASSETS.diamondIcon)} alt="Diamond Icon" className="h-[9px] w-[16px] mr-[3px]" />
                            </div>
                            <span >{activeResult?.winners?.[0]?.win_amount ?? "***"}</span>
                        </div>
                    </div>
                )}
                {activeResult?.winners?.[1]?.avater && (<div className="relative h-[100px] w-[100px]">
                    <img src={resolveAssetUrl(activeResult?.winners?.[1]?.avater ?? "")} alt="abatar" className="absolute left-1/2 h-[50px] w-[50px] -translate-x-1/2 rounded-full object-cover" />
                    <span className="absolute top-[50px] w-[100px] text-center">{activeResult?.winners?.[1]?.id ?? "N/A"}</span>
                    <div className="absolute flex top-[70px] w-[100px] items-center justify-center">
                        <div className="relative ">
                            <img src={getAssetUrl(GAME_ASSETS.diamondIcon)} alt="Diamond Icon" className="h-[9px] w-[16px] mr-[3px]" />
                        </div>
                        <span >{activeResult?.winners?.[1]?.win_amount ?? "***"}</span>
                    </div>
                </div>
                )}
                {activeResult?.winners?.[2]?.avater && (<div className="relative h-[100px] w-[100px]">
                    <img src={resolveAssetUrl(activeResult?.winners?.[2]?.avater ?? "")} alt="image" className="absolute left-1/2 h-[50px] w-[50px] -translate-x-1/2 rounded-full object-cover" />
                    <span className="absolute top-[50px] w-[100px] text-center">{activeResult?.winners?.[2]?.id ?? "N/A"}</span>
                    <div className="absolute flex top-[70px] w-[100px] items-center justify-center">
                        <div className="relative ">
                            <img src={getAssetUrl(GAME_ASSETS.diamondIcon)} alt="Diamond Icon" className="h-[9px] w-[16px] mr-[3px]" />
                        </div>
                        <span >{activeResult?.winners?.[2]?.win_amount ?? "***"}</span>
                    </div>
                </div>
                )}
            </div> */}
        </div>
    )
}

