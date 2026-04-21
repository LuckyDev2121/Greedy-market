import ModalHeaderPlate from "./ModalHeaderPlate";
import { useEffect } from "react";
import { useGame } from "../hooks/useGameHook";

type RankingHelpModalProps = {
    onCloseRankingHelpModal: () => void;
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
export default function RankingHelpModal({
    onCloseRankingHelpModal,
}: RankingHelpModalProps) {
    const { prizeDistribution, handlePrizeDistribution } = useGame();

    useEffect(() => {
        const load = async () => {

            if (!prizeDistribution) {
                await handlePrizeDistribution();
            }
        };
        void load();
    }, [handlePrizeDistribution, prizeDistribution]);

    return (
        <div className="relative h-[567px] w-[383px] bg-amber-500 rounded-[20px]">
            <div className="absolute h-[547px] w-[363px] bg-amber-200  rounded-[20px] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                <span className="absolute w-[200px] top-[10px] text-center text-[15px] text-[#ffe7ba] left-1/2 -translate-x-1/2 font-bold [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown]">
                    Prize distribution
                </span>
                <button className="absolute -right-[15px] -top-[25px] h-[30px] w-[30px] mt-[9px] pl-[7px]  rounded-full bg-[#ee3333]" onClick={onCloseRankingHelpModal}>
                    <CloseIcon />
                </button>
                <div className="absolute top-[40px] w-[333px] h-[240px] left-1/2 -translate-x-1/2 ">
                    <div className="absolute top-[0px] w-[333px] h-[40px] bg-[#915f42] rounded-t-[20px] justify-between flex items-center">
                        <span className="relative text-[#e6cfb5] ml-[60px] text-[20px]">Rank</span>
                        <span className="relative text-[#e6cfb5] mx-[60px] text-[20px]">Prize</span>
                    </div>
                    <div className="absolute top-[40px] w-[333px] h-[40px] bg-[#f7d198] justify-between flex items-center">
                        <span className="relative text-[#86551c] ml-[80px] text-[20px]">{prizeDistribution?.ranks[0].rank_no}</span>
                        <span className="relative text-[#86551c] mx-[50px] text-[20px]">{prizeDistribution?.ranks[0].price}</span>
                    </div>
                    <div className="absolute top-[80px] w-[333px] h-[40px] bg-[#ffc06e] justify-between flex items-center">
                        <span className="relative text-[#86551c] ml-[80px] text-[20px]">{prizeDistribution?.ranks[1].rank_no}</span>
                        <span className="relative text-[#86551c] mx-[50px] text-[20px]">{prizeDistribution?.ranks[1].price}</span>
                    </div>
                    <div className="absolute top-[120px] w-[333px] h-[40px] bg-[#f7d198] justify-between flex items-center">
                        <span className="relative text-[#86551c] ml-[80px] text-[20px]">{prizeDistribution?.ranks[2].rank_no}</span>
                        <span className="relative text-[#86551c] mx-[50px] text-[20px]">{prizeDistribution?.ranks[2].price}</span>
                    </div>
                    <div className="absolute top-[160px] w-[333px] h-[40px] bg-[#ffc06e] justify-between flex items-center">
                        <span className="relative text-[#86551c] ml-[70px] text-[20px]">{prizeDistribution?.ranks[3].rank_no}</span>
                        <span className="relative text-[#86551c] mx-[50px] text-[20px]">{prizeDistribution?.ranks[3].price}</span>
                    </div>
                    <div className="absolute top-[200px] w-[333px] h-[40px] bg-[#f7d198] rounded-b-[20px] justify-between flex items-center">
                        <span className="relative text-[#86551c] ml-[60px] text-[20px]">{prizeDistribution?.ranks[4].rank_no}</span>
                        <span className="relative text-[#86551c] mr-[50px] text-[20px]">{prizeDistribution?.ranks[4].price}</span>
                    </div>
                    <div className="absolute left-[2px] top-[250px] w-[335px] h-[250px] ">
                        {prizeDistribution?.policy.map((element, index) => (
                            <span className="relative left-[0px] top-[0px] mt-[5px] mr-[8px] text-[#86551c] text-[16px]">{element.policy}</span>
                        ))}
                    </div>

                </div>
            </div>
        </div >
    )
}
