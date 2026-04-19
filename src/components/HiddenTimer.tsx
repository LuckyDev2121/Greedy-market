import { useEffect, useRef } from "react";

type HiddenTimerProps = {
    start?: number;
    onHiddenTimeUp?: () => void;
};

export default function HiddenTimer({ start, onHiddenTimeUp }: HiddenTimerProps) {
    const duration = Math.max(0, start ?? 0);
    const onHiddenTimeUpRef = useRef(onHiddenTimeUp);

    useEffect(() => {
        onHiddenTimeUpRef.current = onHiddenTimeUp;
    }, [onHiddenTimeUp]);

    useEffect(() => {
        if (duration <= 0) {
            onHiddenTimeUpRef.current?.();
            return;
        }

        const timer = window.setTimeout(() => {
            onHiddenTimeUpRef.current?.();
        }, duration * 1000);

        return () => window.clearTimeout(timer);
    }, [duration]);

    return (
        <div>
        </div>
    );
}
