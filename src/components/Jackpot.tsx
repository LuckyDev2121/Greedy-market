// import { useEffect, useMemo, } from "react";
import { getAssetUrl, GAME_ASSETS } from "../config/gameConfig";

type JackpotMenuProps = {
    onCloseJackpot: () => void;
};

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

export default function JackpotMenu({ onCloseJackpot }: JackpotMenuProps) {

    return (
        <div className="h-[567px] bg-amber-500 w-[355px] rounded-[20px]">
            <div className="absolute bg-[#fadbad] h-[547px] w-[335px] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 rounded-[20px]">
                <img src={getAssetUrl(GAME_ASSETS.rebons)} alt="leaderPart" className="absolute left-1/2 -translate-x-1/2 -top-[90px]" />
                <span className="absolute left-1/2 -translate-x-1/2 -top-[30px] text-[#ffd991] text-[25px] [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown]">Jackpot</span>
                <button className="absolute -right-[15px] -top-[25px] h-[30px] w-[30px] mt-[9px] pl-[7px]  rounded-full bg-[#ee3333]" onClick={onCloseJackpot}>
                    <CloseIcon />
                </button>
                <img src={getAssetUrl(GAME_ASSETS.congraDiamond)} alt="leaderPart" className="absolute scale-x-125 left-1/2 -translate-x-1/2 top-[10px]" />
                <img src={getAssetUrl(GAME_ASSETS.leaderPart)} alt="leaderPart" className="absolute scale-y-75 left-1/2 -translate-x-1/2 top-[80px]" />
                <img src={getAssetUrl(GAME_ASSETS.diamond)} alt="leaderPart" className="absolute h-[70px] w-[70px] top-[95px] left-[30px]" />
                <span className="absolute left-[90px] top-[110px] text-[#ffd991] text-[32px] [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown]">00000000000</span>
                <span className="absolute left-[10px] top-[200px]  text-[#d37c0a] text-[14px] font-sans justify-center content-center">All players can win the Jackpot. The more you play,</span>
                <span className="absolute  left-1/2 -translate-x-1/2 top-[220px]  text-[#d37c0a] text-[14px] font-sans justify-center content-center">the higher your chances.</span>
                <span className="absolute  left-1/2 -translate-x-1/2 top-[275px]  text-[#d37c0a] text-[20px] font-sans font-extrabold justify-center content-center">Awards</span>

                <div className="absolute top-[300px] bg-[#d37c0a] left-1/2  -translate-x-1/2 rounded-[20px] w-[325px] h-[240px] border-t-[1px] border-t-amber-600">
                    <div className="absolute w-[325px] ">
                        <span className=" absolute left-[20px] top-[5px] text-[15px] text-[#ffde96] ">Round</span>
                        <span className=" absolute left-[150px] top-[5px] text-[15px] text-[#ffde96] ">Win</span>
                        <span className=" absolute left-[250px] top-[5px] text-[15px] text-[#ffde96] ">Time</span>
                    </div>
                    <div className="scrollbar-hidden absolute top-[33px] bg-amber-50/60 left-1/2 rounded-b-[20px] -translate-x-1/2 w-[321px] h-[204px] grip overflow-x-hidden overflow-y-auto">
                        <span className=" absolute left-[5px] top-[30px] text-[12px] text-[#bb8000]" >s:</span>
                    </div>
                </div>
            </div >
        </div >
    )
}
