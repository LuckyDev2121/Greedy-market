import { useEffect, useRef, useState } from "react"
import { getAssetUrl, GAME_ASSETS } from "../config/gameConfig";
import { useGame } from "../hooks/useGameHook";
import type { ResultData } from "../api/api";
const fruits = [
    { id: 5, element_name: "H", top: 40, left: 60 },
    { id: 6, element_name: "G", top: 20, left: 165 },
    { id: 7, element_name: "F", top: 40, left: 270 },
    { id: 8, element_name: "E", top: 150, left: 315 },
    { id: 9, element_name: "D", top: 260, left: 270 },
    { id: 10, element_name: "C", top: 290, left: 165 },
    { id: 11, element_name: "B", top: 260, left: 60 },
    { id: 12, element_name: "A", top: 150, left: 10 },
];

export default function ChooseRectangle({ onChooseTimeUp, RoundId }: { onChooseTimeUp?: () => void; RoundId?: number | null; onResult?: (fruit: string) => void }) {
    const [time, setTime] = useState(0);
    const [second, setSecond] = useState(0);
    const [timestep, setTimestep] = useState(100);
    const [addTime, setAddTime] = useState(0);
    const [resultResponse, setResultResponse] = useState<ResultData | null>(null);
    const onChooseTimeUpRef = useRef(onChooseTimeUp);
    const currentFruit = fruits[(8 + time) % fruits.length];
    const { makeGameRound, makeResult } = useGame();
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
        <div className="absolute z-40" style={{ top: `${fruits[(8 + time) % fruits.length].top}px`, left: `${fruits[(8 + time) % fruits.length].left}px` }}>
            <img src={getAssetUrl(GAME_ASSETS.selectround)} alt="Choose Rectangle" className="relative" />
        </div>
    );
}
