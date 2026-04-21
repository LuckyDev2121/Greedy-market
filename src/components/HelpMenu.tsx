import { useGame } from "../hooks/useGameHook";

type HelpMenuProps = {
    onCloseHelp: () => void;
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


export default function HelpMenu({ onCloseHelp }: HelpMenuProps) {

    const { gameDetails } = useGame();
    return (
        <div className="h-[437px] bg-amber-500 w-[355px] rounded-[20px]">
            <div className="absolute bg-[#fadbad] h-[417px] w-[335px] left-1/2 -translate-x-1/2 top-[10px] rounded-[20px]">
                <span className="absolute  left-1/2 transform -translate-x-1/2 text-sm font-bold mt-1">Rule</span>
                <button className="absolute -right-[15px] -top-[25px] h-[30px] w-[30px] mt-[9px] pl-[7px]  rounded-full bg-[#ee3333]" onClick={onCloseHelp}>
                    <CloseIcon />
                </button>
                <div className="scrollbar-hidden absolute top-[30px]  left-[5px] transform  w-[330px] h-[370px] grip overflow-x-hidden overflow-y-auto">
                    <span className="text-[#d37c0a] font-sans">{gameDetails?.how_to_play?.rules}</span>
                </div>
            </div>
        </div >
    )
}
