import { useEffect, useRef } from "react";
import { getAssetUrl, GAME_ASSETS } from "../config/gameConfig";

type RoundStartTimerProps = {
    onRoundStartUp?: () => void;
};

export default function RoundStartTimer({ onRoundStartUp }: RoundStartTimerProps) {
    const duration = 1
    const onRoundStartUpRef = useRef(onRoundStartUp);

    useEffect(() => {
        onRoundStartUpRef.current = onRoundStartUp;
    }, [onRoundStartUp]);

    useEffect(() => {
        if (duration <= 0) {
            onRoundStartUpRef.current?.();
            return;
        }

        const timer = window.setTimeout(() => {
            onRoundStartUpRef.current?.();
        }, duration * 1000);

        return () => window.clearTimeout(timer);
    }, [duration]);

    return (
        <div>
            <img src={getAssetUrl(GAME_ASSETS.onCard)} alt="onCard" className="absolute left-1/2 top-[80px] -translate-x-1/2  z-40" />
        </div>
    );
}
