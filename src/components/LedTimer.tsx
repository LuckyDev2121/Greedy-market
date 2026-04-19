import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type LedTimerProps = {
    start?: number;
    onLedTimeUp?: () => void;
    onTick?: (timeLeft: number) => void;
};

export default function LedTimer({ start, onLedTimeUp, onTick }: LedTimerProps) {
    const initialTime = Math.max(0, start ?? 0);
    const [time, setTime] = useState(initialTime);
    const onLedTimeUpRef = useRef(onLedTimeUp);
    const onTickRef = useRef(onTick);

    useEffect(() => {
        onLedTimeUpRef.current = onLedTimeUp;
    }, [onLedTimeUp]);

    useEffect(() => {
        onTickRef.current = onTick;
    }, [onTick]);

    useEffect(() => {
        setTime(initialTime);
    }, [initialTime]);

    useEffect(() => {
        onTickRef.current?.(time);
    }, [time]);

    useEffect(() => {
        if (initialTime <= 0) {
            onLedTimeUpRef.current?.();
            return;
        }

        const timer = window.setInterval(() => {
            setTime((prev) => {
                if (prev <= 1) {
                    window.clearInterval(timer);
                    onLedTimeUpRef.current?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => window.clearInterval(timer);
    }, [initialTime]);

    const formatted = String(time).padStart(2, "0");

    return (
        <div>
            <AnimatePresence mode="wait">
                <motion.div
                    key={time}
                    initial={{ opacity: 1, scale: 1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 1 }}
                    style={{ fontFamily: "sans-serif", letterSpacing: "2px", }}
                    className={`relative top-[20px] text-[20px] font-mono font-bold text-white drop-shadow-[0_0_12px_#FFE600] ${time <= 5 ? "animate-pulse" : ""
                        }`}
                >
                    {formatted}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
