import { useGame } from "../hooks/useGameHook";
type RechargeMenuProps = {
    onCloseRechargeModal: () => void;
};

export default function RechargeMenu({ onCloseRechargeModal }: RechargeMenuProps) {
    const { handleRechargeRedirect, rechargeUrl } = useGame();




    return (
        <div className="h-[146px] bg-[#7C2616] w-[402px] rounded-t-[24px] border-[2px] border-[#FEBE00]">
            <span className="absolute flex left-[94px] top-[30px] text-[15px] font-bold">Are you want to Recharge now?</span>
            <div className="absolute top-[79px] h-fit w-full justify-center flex gap-[20px]">
                <button className="w-[157px] h-[31px] rounded-[6px] border-[1px] border-[#b87036] bg-gradient-to-t from-[#FCC024] from-1% via-90% via-[#FDD03C] to-95% to-[#FDF3BA] text-[#ffffff] font-bold [font-family:Poppins,sans-serif] [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown]"
                    onClick={rechargeUrl ? () => { window.location.href = rechargeUrl; } : () => { handleRechargeRedirect(); }}>
                    Recharge
                </button>
                <button className="w-[157px] h-[31px] rounded-[6px] border-[1px] border-[#b87036] bg-gradient-to-t from-[#FCC024] from-1% via-90% via-[#FDD03C] to-95% to-[#FDF3BA] text-[#ffffff] font-bold [font-family:Poppins,sans-serif] [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown]"
                    onClick={onCloseRechargeModal}>
                    Cancel
                </button>
            </div>
        </div>
    )
}
