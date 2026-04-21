import { useEffect, useMemo, } from "react";
import { getAssetUrl, GAME_ASSETS } from "../config/gameConfig";
import { useGame, } from "../hooks/useGameHook";
import { transformGameLog, } from "../utils/transformGameLog";

type NoteMenuProps = {
    onCloseNote: () => void;
};

function formatCreatedAt(value?: string) {
    if (!value) {
        return "--/--/---- --:--:--";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
}

function CloseIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <path
                d="M2.2 2.2L12.8 12.8"
                stroke="white"
                strokeWidth="3.4"
                strokeLinecap="round"
            />
            <path
                d="M12.8 2.2L2.2 12.8"
                stroke="white"
                strokeWidth="3.4"
                strokeLinecap="round"
            />
        </svg>
    );
}

export default function NoteMenu({ onCloseNote }: NoteMenuProps) {
    const { options, playerLog, winToday, handlePlayerLog, handleWinToday } = useGame();

    useEffect(() => {
        const load = async () => {
            if (playerLog.length === 0) {
                await handlePlayerLog();
            }

            if (!winToday) {
                await handleWinToday();
            }
        };
        void load();
    }, [handlePlayerLog, handleWinToday, playerLog.length, winToday]);

    const rounds = useMemo(() => {
        return transformGameLog(playerLog);
    }, [playerLog]);

    const optionById = useMemo(() => {
        return new Map(options.map((option) => [option.id, option]));
    }, [options]);

    return (
        <div className="h-[567px] bg-amber-500 w-[355px] rounded-[20px]">
            <div className="absolute bg-[#fadbad] h-[547px] w-[335px] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 rounded-[20px]">
                <span className="absolute  left-1/2 transform -translate-x-1/2 text-sm font-bold mt-1">Game records</span>
                <button className="absolute -right-[15px] -top-[25px] h-[30px] w-[30px] mt-[9px] pl-[7px]  rounded-full bg-[#ee3333]" onClick={onCloseNote}>
                    <CloseIcon />
                </button>
                <div className="scrollbar-hidden absolute top-[30px]  left-1/2 transform -translate-x-1/2 w-[325px] h-[500px] grip overflow-x-hidden overflow-y-auto">
                    {rounds.map((item) => {
                        const winningOption = item.winning_option_id[0]
                            ? optionById.get(item.winning_option_id[0])
                            : undefined;
                        return (
                            <div key={item.round_id} className="relative mt-[5px] bg-amber-300/30 rounded-[20px] w-[325px] h-[150px] border-t-[1px] border-t-amber-600">
                                <div className="absolute w-[325px] flex justify-between mx-[20px] mt-[5px]">
                                    <span className=" relative text-[15px] text-[#bb8000] ">Round: {item.round_id}</span>
                                    <span className=" relative text-[15px] pr-[30px] text-[#bb8000]  ">{formatCreatedAt(item.created_at)}</span>
                                </div>
                                <div className="absolute w-[300px] top-[25px] h-[1px] left-1/2 -translate-x-1/2 bg-amber-600/50"></div>
                                <div>
                                    <span className=" absolute left-[5px] top-[30px] text-[12px] text-[#bb8000]" >Selected option:</span>
                                    <div className="absolute top-[38px] bg-white grid grid-cols-4 grid-rows-2 gap-[0px]">
                                        {item.detail.map((element) => {
                                            const option = optionById.get(element.option_id);
                                            if (element.bet_amount && option) {
                                                return (
                                                    <div key={element.option_id} className="relative w-[75px] h-[20px] justify-center items-center flex " >
                                                        <img src={getAssetUrl(option.logo)} alt={option.name} className="h-4 w-4 mr-[2px]" />
                                                        <div className=" justify-center items-center content-center h-[14px] w-[10px]">
                                                            <img src={getAssetUrl(GAME_ASSETS.diamond)} alt="Diamond Icon" className="h-[9px] w-[16px] mr-[5px]" />
                                                        </div>
                                                        <span className=" items-center ml-[2px]">{element.bet_amount}</span>
                                                    </div>
                                                );
                                            }
                                        })}
                                    </div>
                                    <span className=" absolute left-[5px] top-[80px] text-[12px] text-[#bb8000] ">Winning items:
                                        {item.winning_option_id.length === 1 && winningOption && (
                                            <img
                                                src={getAssetUrl(winningOption.logo)}
                                                alt="a"
                                                className="w-[20px] h-[20px] ml-[10px]"
                                            />
                                        )}
                                        {item.winning_option_id.length > 1 && item.winning_option_id[0] === 20 && (
                                            <img
                                                key={item.winning_option_id[0]}
                                                src={getAssetUrl(GAME_ASSETS.veg)}
                                                alt="a"
                                                className="w-[20px] h-[20px] ml-[10px]"
                                            />
                                        )}
                                        {item.winning_option_id.length > 1 && item.winning_option_id[0] === 24 && (
                                            <img
                                                key={item.winning_option_id[0]}
                                                src={getAssetUrl(GAME_ASSETS.drink)}
                                                alt="a"
                                                className="w-[20px] h-[20px] ml-[10px]"
                                            />
                                        )}
                                    </span>
                                    <span className=" absolute left-[5px] top-[100px] text-[12px] text-[#bb8000] ">Win diamonds:</span>
                                    <span className=" absolute left-[5px] top-[120px] text-[12px] text-[#bb8000] ">Diamond Balance:</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
                {/* {rounds.map((item) => {
                        const result = new Date(new Date().getTime() - (39 * item.round_id) * 1000)
                        const formatDate = (date: Date) => {
                            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
                        };
                        const winningOption = item.winning_option_id[0]
                            ? optionById.get(item.winning_option_id[0])
                            : undefined;
                        return (
                            <div key={item.round_id} className="relative h-[134px] w-[324px] flex px-3 pt-2 pb-5  bg-[#450371] rounded-[12px] mt-[40px] ">
                                <div className="absolute w-[300px] flex justify-between">
                                    <span className=" relative  text-[10px] text-[#FFFFFF]/60 ">Round {item.round_id}</span>
                                    <span className=" relative   text-[10px] text-[#FFFFFF]/60  ">{formatDate(result)}</span>
                                </div>
                                <div className="absolute w-[300px] top-[30px] justify-between items-center flex">
                                    <span className=" relative flex  items-center">Winning
                                        {item.winning_option_id.length === 1 && winningOption && (
                                            <img
                                                src={getAssetUrl(winningOption.logo)}
                                                alt="a"
                                                className="w-[20px] h-[20px] ml-[10px]"
                                            />
                                        )}
                                        {item.winning_option_id.length > 1 && item.winning_option_id[0] === 5 && (
                                            <img
                                                key={item.winning_option_id[0]}
                                                src={getAssetUrl("fruit-jackpot/small.svg")}
                                                alt="a"
                                                className="w-[20px] h-[20px] ml-[10px]"
                                            />
                                        )}
                                        {item.winning_option_id.length > 1 && item.winning_option_id[0] === 9 && (
                                            <img
                                                key={item.winning_option_id[0]}
                                                src={getAssetUrl("fruit-jackpot/big.svg")}
                                                alt="a"
                                                className="w-[20px] h-[20px] ml-[10px]"
                                            />
                                        )}
                                    </span >
                                    <span className=" relative   ">{item.status ? "WIN" : "LOSE"}
                                    </span>
                                </div>
                          
                            </div>
                        )
                    })} */}

            </div >
        </div >
    )
}
