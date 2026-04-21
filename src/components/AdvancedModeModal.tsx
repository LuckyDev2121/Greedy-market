import { GAME_ASSETS, getAssetUrl } from "../config/gameConfig";
import ModalHeaderPlate from "./ModalHeaderPlate";
type AdvancedModalProps = {
    onCloseAdvanced: () => void;
    onOk: () => void;
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


export default function AdvancedModal({ onCloseAdvanced, onOk }: AdvancedModalProps) {
    return (
        <div className="h-[437px]  bg-amber-500 w-[355px] rounded-[20px]">
            <div className="absolute bg-[#fadbad] h-[417px] w-[335px] left-1/2 -translate-x-1/2 top-[10px] rounded-[20px]">
                <div className="absolute left-1/2 -translate-x-1/2 -top-[30px] h-[70px] w-[240px]">
                    <ModalHeaderPlate />
                </div>
                <span className="absolute  left-1/2 transform -translate-x-1/2 text-[20px] -top-[20px] font-bold mt-1 text-[#f7ebb9] [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown]">Advanced Mode</span>
                <button className="absolute -right-[15px] -top-[25px] h-[30px] w-[30px] mt-[9px] pl-[7px]  rounded-full bg-[#ee3333]" onClick={onCloseAdvanced}>
                    <CloseIcon />
                </button>
                <span className="absolute left-[15px] top-[30px] h-[px] w-[315px] text-[#8b5414] text-[14px]">Users who have placed bets exceeding 500,000 coins in the past 7 days can unlock the premium mode.</span>
                <span className="absolute left-[15px] top-[110px] h-[px] w-[315px] text-[#8b5414] text-[14px]">Keep going!  Only { }diamonds to unlock!</span>
                <img src={getAssetUrl(GAME_ASSETS.congraDiamond)} alt="diamond" className="absolute left-1/2 -translate-x-1/2 top-[130px]  " />
                <span className="absolute left-[15px] top-[260px] h-[px] w-[315px] text-[#8b5414] text-[14px]">Higher probability of winning more diamonds in Advanced Mode!</span>
                <span className="absolute left-[10px] top-[320px] h-[px] w-[320px] text-[#8b5414] text-[14px]">In the Advanced Mode, you can get more diamonds when you open the treasure chest.</span>
                <button className="absolute left-1/2  bg-gradient-to-t from-[#269726] to-[#91f897] -translate-x-1/2 rounded-full border-[1px] border-[#000000] top-[370px] h-[30px] w-[100px] text-[#ffffff]"
                    onClick={onOk}>OK</button>
            </div>
        </div >
    )
}
