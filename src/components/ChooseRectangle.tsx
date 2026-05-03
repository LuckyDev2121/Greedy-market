import { useEffect, useRef, useState } from "react"
import { useGame } from "../hooks/useGameHook";
import { type ResultData } from "../api/api";
const fruits = [
    { id: 27, element_name: "H", top: 37, left: 50 },
    { id: 20, element_name: "G", top: 16, left: 156 },
    { id: 21, element_name: "F", top: 37, left: 262 },
    { id: 22, element_name: "E", top: 147, left: 307 },
    { id: 23, element_name: "D", top: 257, left: 262 },
    { id: 24, element_name: "C", top: 286, left: 156 },
    { id: 25, element_name: "B", top: 257, left: 50 },
    { id: 26, element_name: "A", top: 147, left: 2 },
];
// { id: 27, height: 87, width: 97, top: 28, left: 47 },
//         { id: 26, height: 87, width: 96, top: 140, left: 3 },
//         { id: 25, height: 84, width: 98, top: 248, left: 47 },
//         { id: 24, height: 85, width: 98, top: 277, left: 152 },
//         { id: 23, height: 84, width: 99, top: 248, left: 259 },
//         { id: 22, height: 87, width: 96, top: 140, left: 305 },
//         { id: 21, height: 87, width: 98, top: 28, left: 260 },
//         { id: 20, height: 82, width: 98, top: 8, left: 153 },
export default function ChooseRectangle({ onChooseTimeUp, RoundId }: { onChooseTimeUp?: () => void; RoundId?: number | null; onResult?: (fruit: string) => void }) {
    const [time, setTime] = useState(0);
    const [second, setSecond] = useState(0);
    const [timestep, setTimestep] = useState(100);
    const [addTime, setAddTime] = useState(0);

    const [resultResponse, setResultResponse] = useState<ResultData | null>(null);
    const onChooseTimeUpRef = useRef(onChooseTimeUp);
    const currentFruit = fruits[(8 + time) % fruits.length];
    const { makeGameRound,
        makeResult } = useGame();
    const [steps, setSteps] = useState(0);
    const result = resultResponse ?? makeResult;

    useEffect(() => {
        onChooseTimeUpRef.current = onChooseTimeUp;
    }, [onChooseTimeUp]);

    useEffect(() => {
        if (second >= 6820) {
            onChooseTimeUpRef.current?.(); // trigger notification
            return;
        }
        const timer = setInterval(() => {
            if (second <= 4000) {
                setSecond((s) => s + 100);
                setTime((t) => t + 1);
                setTimestep(100);
                if (second === 1000) {
                    if (RoundId) {
                        void makeGameRound(RoundId)
                            .then((response) => {
                                setResultResponse(response);
                            })
                            .catch((error) => {
                                console.error(error);
                            });
                    }
                }
                if (second === 4000) {
                    const winningId = Array.isArray(result?.winning_option_id)
                        ? Number(result.winning_option_id[0])
                        : result?.winning_option_id ?? 0;

                    setSteps((winningId - currentFruit.id + fruits.length) % fruits.length);
                }
            }

            if (second > 4000 && second < 6820) {
                if (steps === 1) {
                    if (second < 5900) {
                        setSecond((s) => s + 300);
                        setTime((t) => t + 1);
                        setTimestep(300);
                    } else {
                        setSecond((s) => s + 400 + addTime * 100);
                        setTime((t) => t + 1);
                        setAddTime((a) => a + 1);
                        setTimestep(400 + addTime * 100);
                    }
                }
                if (steps === 2) {
                    if (second < 4600) {
                        setSecond((s) => s + 100);
                        setTime((t) => t + 1);
                        setTimestep(100);
                    } else {
                        setSecond((s) => s + 400 + addTime * 100);
                        setTime((t) => t + 1);
                        setAddTime((a) => a + 1);
                        setTimestep(400 + addTime * 100);
                    }
                }
                if (steps === 3) {
                    if (second < 5600) {
                        setSecond((s) => s + 100);
                        setTime((t) => t + 1);
                        setTimestep(100);
                    } else {
                        setSecond((s) => s + 300 + addTime * 100);
                        setTime((t) => t + 1);
                        setAddTime((a) => a + 1);
                        setTimestep(300 + addTime * 100);
                    }
                }
                if (steps === 4) {
                    setSecond((s) => s + 800 + addTime * 100);
                    setTime((t) => t + 1);
                    setAddTime((a) => a + 1);
                    setTimestep(800 + addTime * 100);
                }
                if (steps === 5) {
                    if (second < 5000) {
                        setSecond((s) => s + 100);
                        setTime((t) => t + 1);
                        setTimestep(100);
                    } else {
                        setSecond((s) => s + 500 + addTime * 100);
                        setTime((t) => t + 1);
                        setAddTime((a) => a + 1);
                        setTimestep(500 + addTime * 100);
                    }
                }
                if (steps === 6) {
                    if (second < 5000) {
                        setSecond((s) => s + 100);
                        setTime((t) => t + 1);
                        setTimestep(100);
                    } else {
                        setSecond((s) => s + 300 + addTime * 100);
                        setTime((t) => t + 1);
                        setAddTime((a) => a + 1);
                        setTimestep(300 + addTime * 100);
                    }
                }
                if (steps === 7) {
                    setSecond((s) => s + 100 + addTime * 100);
                    setTime((t) => t + 1);
                    setAddTime((a) => a + 1);
                    setTimestep(100 + addTime * 100);
                }
                if (steps === 0) {
                    if (second > 5000) {
                        setSecond((s) => s + 500);
                        setTime((t) => t + 1);
                        setTimestep(500);
                    } else {
                        setSecond((s) => s + 100 + addTime * 100);
                        setTime((t) => t + 1);
                        setAddTime((a) => a + 1);
                        setTimestep(100 + addTime * 100);
                    }
                }
            }
        }, timestep);
        return () => {
            clearInterval(timer)
        };
    }, [second, time,]);
    return (
        <div className="relative  h-[400px] w-[402px] z-40">
            {fruits.map((item, index) => (
                (8 + time) % fruits.length) === index ? (
                <div className="absolute z-40 h-[87px] w-[90px] rounded-[20px]" style={{ top: `${fruits[(8 + time) % fruits.length].top}px`, left: `${fruits[(8 + time) % fruits.length].left}px` }}>
                </div>
            ) :
                (
                    <div className="absolute z-40 h-[87px] w-[90px] rounded-[20px] bg-black/30" style={{ top: `${item.top}px`, left: `${item.left}px` }} />
                )
            )}
        </div>
    );
}
