import { useEffect, useRef, } from "react";
import { useGame } from '../hooks/useGameHook';
import { getAssetUrl, GAME_ASSETS } from "../config/gameConfig";

type ResultTimerProps = {
    start?: number;
    onResultTimeUp?: () => void;
    RoundId?: number | null;
};

export default function ResultTimer({ start, onResultTimeUp }: ResultTimerProps) {
    const duration = Math.max(0, start ?? 0);
    const onResultTimeUpRef = useRef(onResultTimeUp);
    const { makeResult, } = useGame();
    const activeResult = makeResult;
    const winningIds = Array.isArray(activeResult?.winning_option_id)
        ? activeResult.winning_option_id.map(Number)
        : activeResult?.winning_option_id !== undefined
            ? [activeResult.winning_option_id]
            : [];

    const gridMap = [
        { id: 12, top: 25, left: 50 },
        { id: 11, top: 140, left: 2 },
        { id: 10, top: 245, left: 50 },
        { id: 9, top: 275, left: 155 },
        { id: 8, top: 245, left: 262 },
        { id: 7, top: 140, left: 310 },
        { id: 6, top: 25, left: 262 },
        { id: 5, top: 5, left: 155 },
    ];

    useEffect(() => {
        onResultTimeUpRef.current = onResultTimeUp;
    }, [onResultTimeUp]);

    useEffect(() => {
        if (duration <= 0) {
            onResultTimeUpRef.current?.();
            return;
        }

        const timer = window.setTimeout(() => {
            onResultTimeUpRef.current?.();
        }, duration * 1000);

        return () => window.clearTimeout(timer);
    }, [duration]);

    return (
        <div className='absolute  z-30   '>
            {gridMap.map((item) => (
                winningIds.includes(item.id) ? (
                    <div key={item.id} className={`absolute left-${item.left} top-${item.top} z-40`}>
                        <img
                            src={getAssetUrl(GAME_ASSETS.selectround)}
                            className="absolute -left-[2px] -top-[8px] h-[100px] w-[96px]"
                        />
                    </div>
                ) : (
                    <div
                        key={item.id}
                        className={`absolute left-${item.left} top-${item.top} z-40 bg-black/50 rounded-[8px]`}
                    />
                )
            ))}
        </div >
    );
}
