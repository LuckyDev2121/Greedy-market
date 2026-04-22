import { useEffect, useMemo, useRef, useState } from "react";
import { getAssetUrl, GAME_ASSETS } from "../config/gameConfig";
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

            if (optionId < 24) timer = 5;
            else if (optionId === 24) timer = 10;
            else if (optionId === 25) timer = 15;
            else if (optionId === 26) timer = 25;
            else if (optionId === 27) timer = 45;

            const betAmount = previousRoundBets[optionId] ?? 0;

            total += betAmount * timer;
        });

        return total;
    }, [activeResult, previousRoundBets]);


    const resultMessage = useMemo(() => {
        if (totalBetAmount === 0) {
            return "Did not participate in this round";
        }

    }, [totalBetAmount,]);

    const getResultOptionLogo = (optionId: number) => {
        return optionMap[optionId]
            ? resolveAssetUrl(optionMap[optionId])
            : "";
    };

    useEffect(() => {
        void refreshGameData({ resetPendingBalanceDeduction: true });
    }, [refreshGameData]);


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

    return (
        <div className="absolute h-[400px]  w-[400px] top-[300px]">
            {winningDiamondAmount > 0 && (
                <img src={getAssetUrl(GAME_ASSETS.winResult)} alt="result" className="absolute h-[374px] w-[374px] scale-110 left-[17px] z-[100]" />
            )}
            {winningDiamondAmount === 0 && (
                <img src={getAssetUrl(GAME_ASSETS.result)} alt="result" className="absolute h-[374px] w-[374px]  top-[49px] left-[20px] z-[100]" />
            )}
            {winningDiamondAmount >= 0 && totalBetAmount !== 0 && (
                <div className="absolute z-[110] left-[130px] top-[120px] flex">
                    <img
                        src={getAssetUrl(GAME_ASSETS.diamond)}
                        alt="Diamond Icon"
                        className=" h-[70px] w-[70px] "
                    />
                    <span className=" text-[30px] mt-[15px]">{formatDiamondAmount(winningDiamondAmount)}</span>
                </div>
            )}
            {totalBetAmount === 0 && (
                <span className="absolute z-[110] left-[150px] top-[145px] text-[15px]">{resultMessage}</span>
            )}
            {activeResult && (
                isJackpot ? (
                    <img
                        src={resolveAssetUrl(activeResult.jackpot_avatar ?? "")}
                        alt="selectedFruit"
                        className={`absolute z-[110]  top-[130px] left-[80px] h-[50px] w-[50px]`}
                    />
                )
                    : (
                        <img
                            src={getResultOptionLogo(activeResult.winning_option_id[0])}
                            alt="selectedFruit"
                            className={`absolute z-[110]  top-[130px] left-[80px] h-[50px] w-[50px]`}
                        />
                    )
            )}
            <div className="absolute  z-[100] left-[60px] top-[200px]">
                {activeResult?.winners?.[0]?.avater && (
                    <div className="relative w-[312px] h-[47px] mt-[10px]  ">
                        <div className="absolute left-[0px] h-[47px] w-[47px]  rounded-l-[10px]">
                            <img src={getAssetUrl(GAME_ASSETS.prize1)} alt="prize" className=" absolute h-[35px] w-[35px] left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2" />
                        </div>
                        <div className="absolute left-[47px] flex h-[47px] w-[245px] items-center rounded-r-[10px]">
                            <img src={resolveAssetUrl(activeResult?.winners?.[0]?.avater ?? "")} alt="avatar" className="absolute  left-[0px] h-[40px] w-[40px]" />
                            <span className="absolute left-[50px] text-[#fde4c7] font-bold  h-[40px] w-[80px] content-center">{activeResult?.winners?.[0]?.username}</span>
                            <img src={getAssetUrl(GAME_ASSETS.diamond)} alt="diamond" className="absolute left-[130px] h-[40px] w-[40px]" />
                            <span className="absolute left-[160px] text-[#fde4c7] font-bold  h-[40px] w-[80px] content-center">{activeResult?.winners?.[0]?.win_amount ? formatDiamondAmount(activeResult?.winners?.[0]?.win_amount) : "0"}</span>
                        </div>
                    </div>
                )}
                {activeResult?.winners?.[1]?.avater && (
                    <div className="relative w-[292px] h-[47px] mt-[5px] flex">
                        <div className="relative h-[47px] w-[47px]  rounded-l-[10px]">
                            <img src={getAssetUrl(GAME_ASSETS.prize2)} alt="prize" className="absolute h-[35px] w-[35px] left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 " />
                        </div>
                        <div className="relative flex h-[47px] w-[245px]  items-center rounded-r-[10px]">
                            <img src={resolveAssetUrl(activeResult?.winners?.[1]?.avater ?? "")} alt="avatar" className="absolute  left-[0px] h-[40px] w-[40px]" />
                            <span className="absolute left-[50px] text-[#fde4c7] font-bold  h-[40px] w-[80px] content-center">{activeResult?.winners?.[1]?.username}</span>
                            <img src={getAssetUrl(GAME_ASSETS.diamond)} alt="diamond" className="absolute left-[130px] h-[40px] w-[40px]" />
                            <span className="absolute left-[160px] text-[#fde4c7] font-bold  h-[40px] w-[80px] content-center">{activeResult?.winners?.[1]?.win_amount ? formatDiamondAmount(activeResult?.winners?.[1]?.win_amount) : "0"}</span>
                        </div>
                    </div>
                )}
                {activeResult?.winners?.[2]?.avater && (
                    <div className="relative w-[292px] h-[47px] mt-[5px] flex">
                        <div className="relative h-[47px] w-[47px]  rounded-l-[10px]">
                            <img src={getAssetUrl(GAME_ASSETS.prize3)} alt="prize2" className="absolute h-[35px] w-[35px] left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2" />
                        </div>
                        <div className="relative flex h-[47px] w-[245px]  items-center rounded-r-[10px]">
                            <img src={resolveAssetUrl(activeResult?.winners?.[2]?.avater ?? "")} alt="avatar" className="absolute  left-[0px] h-[40px] w-[40px]" />
                            <span className="absolute left-[50px] text-[#fde4c7] font-bold  h-[40px] w-[80px] content-center">{activeResult?.winners?.[2]?.username}</span>
                            <img src={getAssetUrl(GAME_ASSETS.diamond)} alt="diamond" className="absolute left-[130px] h-[40px] w-[40px]" />
                            <span className="absolute left-[160px] text-[#fde4c7] font-bold  h-[40px] w-[80px] content-center">{activeResult?.winners?.[2]?.win_amount ? formatDiamondAmount(activeResult?.winners?.[2]?.win_amount) : "0"}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

