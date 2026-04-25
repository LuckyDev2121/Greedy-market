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
        { id: 27, height: 87, width: 97, top: 28, left: 47 },
        { id: 26, height: 87, width: 96, top: 140, left: 3 },
        { id: 25, height: 84, width: 98, top: 248, left: 47 },
        { id: 24, height: 85, width: 98, top: 277, left: 152 },
        { id: 23, height: 84, width: 99, top: 248, left: 259 },
        { id: 22, height: 87, width: 96, top: 140, left: 305 },
        { id: 21, height: 87, width: 98, top: 28, left: 260 },
        { id: 20, height: 82, width: 98, top: 8, left: 153 },
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
                        className={`absolute z-40 bg-black/30 rounded-t-[15px] rounded-b-[28px] [clip-path:polygon(5%_0%,92%_0%,100%_100%,0%_100%)]`}
                        style={{ height: `${item.height}px`, width: `${item.width}px`, top: `${item.top}px`, left: `${item.left}px` }}
                    />
                )
            ))}
        </div >
    );
}
