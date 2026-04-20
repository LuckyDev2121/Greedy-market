import { useEffect, useRef, } from "react";
import { useGame } from '../hooks/useGameHook';

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
        { id: 27, top: 25, left: 50 },
        { id: 26, top: 140, left: 2 },
        { id: 25, top: 245, left: 50 },
        { id: 24, top: 275, left: 155 },
        { id: 23, top: 245, left: 262 },
        { id: 22, top: 140, left: 310 },
        { id: 21, top: 25, left: 262 },
        { id: 20, top: 5, left: 155 },
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
        <div className='relative top-[8px] h-[400px] w-[402px] z-40 left-1/2 -translate-x-1/2'>
            {gridMap.map((item) => (
                winningIds.includes(item.id) ? (
                    <div key={item.id} className={`absolute h-[87px] w-[90px] z-40`}
                        style={{ top: `${item.top}px`, left: `${item.left}px` }}>
                    </div>
                ) : (
                    <div
                        key={item.id}
                        className={`absolute h-[87px] w-[90px] z-40 bg-black/30 rounded-[8px]`}
                        style={{ top: `${item.top}px`, left: `${item.left}px` }}
                    />
                )
            ))}
        </div >
    );
}
