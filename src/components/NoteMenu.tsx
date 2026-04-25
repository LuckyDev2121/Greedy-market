import { useMemo } from "react";
import { getAssetUrl, GAME_ASSETS } from "../config/gameConfig";
import { useGame } from "../hooks/useGameHook";
import ModalHeaderPlate from "./ModalHeaderPlate";

type NoteMenuProps = {
    onCloseNote: () => void;
    isAdvanced: boolean;
};

function formatNumber(num: number): string {
    if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    }
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1_000) {
        return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toString();
}

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

export default function NoteMenu({ onCloseNote, isAdvanced }: NoteMenuProps) {
    const { options, basicHistory, advanceHistory, } = useGame();

    const optionById = useMemo(() => {
        return new Map(options.map((option) => [option.id, option]));
    }, [options]);

    const historyData = isAdvanced ? (advanceHistory?.data ?? []) : (basicHistory?.data ?? []);

    return (
        <div className="h-[567px] bg-amber-500 w-[355px] rounded-[20px]">
            <div className="absolute bg-[#fadbad] h-[547px] w-[335px] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 rounded-[20px]">
                <div className="absolute left-1/2 -translate-x-1/2 -top-[30px] h-[70px] w-[240px]">
                    <ModalHeaderPlate />
                </div>
                <span className="absolute  left-1/2 transform -translate-x-1/2 text-[20px] -top-[20px] font-bold mt-1 text-[#f7ebb9] [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown]">Game records</span>
                <button className="absolute -right-[15px] -top-[25px] h-[30px] w-[30px] mt-[9px] pl-[7px]  rounded-full bg-[#ee3333]" onClick={onCloseNote}>
                    <CloseIcon />
                </button>
                <div className="scrollbar-hidden absolute top-[30px]  left-1/2 transform -translate-x-1/2 w-[325px] h-[500px] grip overflow-x-hidden overflow-y-auto">
                    {historyData.map((item) => {
                        const winningOption = optionById.get(item.winning_option_id[0]);
                        // let total = 0;

                        // item.winning_option_id.forEach((optionId) => {
                        //     let timer = 0;
                        //     let betAmount = 0;

                        //     if (optionId < 24) timer = 5;
                        //     else if (optionId === 24) timer = 10;
                        //     else if (optionId === 25) timer = 15;
                        //     else if (optionId === 26) timer = 25;
                        //     else if (optionId === 27) timer = 45;

                        //     item.selected_options?.forEach((selectedOption) => {
                        //         if (selectedOption.option_id === optionId && selectedOption.total_amount) {
                        //             betAmount = selectedOption.total_amount;
                        //         }
                        //     });

                        //     total += timer * betAmount;
                        // });

                        return (
                            <div key={item.round_no} className="relative mt-[5px] bg-amber-300/30 rounded-[20px] w-[325px] h-[150px] border-t-[1px] border-t-amber-600">
                                <div className="absolute w-[325px] flex justify-between mx-[20px] mt-[5px]">
                                    <span className=" relative text-[15px] text-[#bb8000] ">Round: {item.round_no}</span>
                                    <span className=" relative text-[15px] pr-[30px] text-[#bb8000]  ">{formatCreatedAt(item.round_created_at)}</span>
                                </div>
                                <div className="absolute w-[300px] top-[25px] h-[1px] left-1/2 -translate-x-1/2 bg-amber-600/50"></div>
                                <span className=" absolute left-[5px] top-[30px] text-[12px] text-[#bb8000]" >Selected option:</span>
                                <div className="absolute top-[45px]  grid grid-cols-4 grid-rows-2 gap-[0px] ">
                                    {item.selected_options?.map((element) => {
                                        const option = element.option_id !== undefined
                                            ? optionById.get(element.option_id)
                                            : undefined;

                                        if (element.total_amount && option) {
                                            return (
                                                <div key={element.option_id} className="relative w-[75px] h-[20px] bg-[#e4a553] rounded-[8px] justify-center items-center flex ">
                                                    <img src={getAssetUrl(option.logo)} alt={option.name} className="h-4 w-4 mr-[2px]" />
                                                    <span className=" items-center ml-[2px]">{formatNumber(element.total_amount)}</span>
                                                </div>
                                            );
                                        }

                                        return null;
                                    })}
                                </div>
                                <span className=" absolute flex left-[5px] top-[90px] text-[12px] text-[#bb8000] ">Winning items:
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
                                <span className=" absolute left-[5px] top-[110px] text-[12px] text-[#bb8000] ">Win diamonds:{formatNumber(item.win_amount ?? 0)}</span>
                                <span className=" absolute left-[5px] top-[130px] text-[12px] text-[#bb8000] ">Diamond Balance: {`${formatNumber(Number.parseInt(item.post_balance ?? "0", 10))}=>${formatNumber(Number.parseInt(item.new_balance ?? "0", 10))}`}</span>
                            </div>
                        );
                    })}
                </div>
            </div >
        </div >
    );
}
