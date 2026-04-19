import Checkbox from "./CheckBox";
import { getAssetUrl, GAME_ASSETS } from "../config/gameConfig";

type RepeatModalProps = {
    onCloseRepeatModal: () => void;
    onConfirmRepeat: () => void;
    previousRoundTotal: number;
    skipNextRepeatModal: boolean;
    onSkipNextRepeatModalChange: (checked: boolean) => void;
    hasInsufficientBalance: boolean;
};

function formatAmount(amount: number): string {
    if (amount >= 1_000_000_000) {
        return `${(amount / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
    }
    if (amount >= 1_000_000) {
        return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (amount >= 1_000) {
        return `${(amount / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
    }

    return amount.toString();
}

export default function RepeatModal({
    onCloseRepeatModal,
    onConfirmRepeat,
    previousRoundTotal,
    skipNextRepeatModal,
    onSkipNextRepeatModalChange,
    hasInsufficientBalance,
}: RepeatModalProps) {
    return (
        <div className="relative h-[245px] w-[340px]  bg-gradient-to-t from-[#6D1F92] to-[#B935F8]  rounded-[32px]">
            <span className="absolute top-[23px] flew px-[39px] text-center text-[15px] font-bold">
                {hasInsufficientBalance ? "Sorry balance is bad" : "Are you sure to repeat the previous round of betting?"}
            </span>
            <div className="absolute top-[73px] flex z-20 w-full left-1/2 transform -translate-x-1/2 items-center justify-center">
                <div className="ml-[9px] justify-center items-center flex">
                    <img src={getAssetUrl(GAME_ASSETS.diamondIcon)} alt="Diamond Icon" className="h-[9px] w-[16px] mr-[3px]" />
                </div>
                <span className="ml-2.5  font-bold">{formatAmount(previousRoundTotal)}</span>
            </div>
            <div className="absolute top-[106px] flex z-20 w-full left-1/2 transform -translate-x-1/2 items-center justify-center">
                <Checkbox
                    label="Don't show next time"
                    checked={skipNextRepeatModal}
                    onChange={onSkipNextRepeatModalChange}
                />
            </div>
            <button
                className="absolute w-[191px] h-[38px] rounded-[6px] top-[136px] left-1/2 transform -translate-x-1/2 border-[1px] border-[#b87036] bg-gradient-to-t from-[#b87036] from-1% via-90% via-[#FDD03c] to-95% to-[#fdf3ba]  text-[#A04800] font-bold disabled:cursor-not-allowed disabled:opacity-60"
                onClick={onConfirmRepeat}
                disabled={hasInsufficientBalance || previousRoundTotal <= 0}
            >
                Confirm
            </button>
            <button className="absolute w-[191px] h-[38px] rounded-[6px] top-[182px] left-1/2 transform -translate-x-1/2 border-[1px] border-[#891ac1] bg-gradient-to-t from-[#891ac1] from-1% via-90% via-[#d494f4] to-99% to-[#fdf3ba]  text-[#27598e] font-bold"
                onClick={onCloseRepeatModal}>
                Cancel
            </button>
        </div>
    )
}
