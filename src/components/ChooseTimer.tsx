import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ChooseTimerProps = {
    start?: number;
    onChooseTimeUp?: () => void;
};

export default function ChooseTimer({ start, onChooseTimeUp }: ChooseTimerProps) {
    const initialTime = Math.max(0, start ?? 0);
    const [time, setTime] = useState(initialTime);
    const onChooseTimeUpRef = useRef(onChooseTimeUp);


    useEffect(() => {
        onChooseTimeUpRef.current = onChooseTimeUp;
    }, [onChooseTimeUp]);

    useEffect(() => {
        if (initialTime <= 0) {
            onChooseTimeUpRef.current?.();

            return;
        }

        const timer = window.setInterval(() => {
            setTime((prev) => {
                if (prev <= 1) {
                    window.clearInterval(timer);
                    onChooseTimeUpRef.current?.();
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
                    style={{ fontFamily: "sans-serif", letterSpacing: "2px" }}
                    className={`relative top-[20px] text-[20px] font-mono font-bold text-white drop-shadow-[0_0_12px_#FFE600] ${time <= 5 ? "animate-pulse" : ""
                        }`}
                >
                    {formatted}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
