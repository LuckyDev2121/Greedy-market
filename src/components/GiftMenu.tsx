import { getAssetUrl, GAME_ASSETS } from "../config/gameConfig";
import MenuButton from "./MenuButton";
type GiftMenuProps = {
    onCloseGift: () => void;
    giftAmount: number;
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

export default function GiftMenu({ onCloseGift, giftAmount }: GiftMenuProps) {

    return (
        <div className="h-[567px]  w-[355px] rounded-[20px]">
            <span className="absolute left-1/2 -translate-x-1/2 text-[40px] [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown] text-[#eebf23]">Congratulations!</span>
            <img src={getAssetUrl(GAME_ASSETS.congraDiamond)} alt="congraDiamond" className="absolute top-[80px] left-1/2 -translate-x-1/2" />
            <div className="absolute left-1/2 -translate-x-1/2 top-[220px] items-center justify-center flex">
                <img src={getAssetUrl(GAME_ASSETS.diamond)} alt="diamond" className="relative h-[60px]" />
                <span className="relative text-[20px] ">{giftAmount}</span>
            </div>
            <div className="absolute top-[350px] left-1/2 -translate-x-1/2">
                <MenuButton
                    borderColor="none"
                    borderWidth="0px"
                    icon={<CloseIcon />}
                    background={"#000000"}
                    onClick={onCloseGift}
                />
            </div>
        </div >
    )
}
