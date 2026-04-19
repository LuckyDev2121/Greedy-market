import { useEffect } from "react";
import { getAssetUrl, GAME_ASSETS } from "../config/gameConfig";
import { useGame } from "../hooks/useGameHook";
import CoinBoardPlate from "./CoinBoardPlate";

type CoinBoardProps = {
  onOpenModal: (modal: string) => void;
};

export default function CoinBoard({ onOpenModal }: CoinBoardProps) {
  const { playerInfo, displayBalance, } = useGame();

  useEffect(() => {
    if (playerInfo?.avater) {
      const img = new Image();
      img.src = playerInfo?.avater;
    }
  }, [playerInfo?.avater]);

  return (
    <div className="z-[530] flex items-center" style={{ height: "26px" }}>
      <button className="flex items-center relative" style={{ width: "107px", height: "26px" }} onClick={() => onOpenModal("recharge")}>
        <CoinBoardPlate className="z-10 absolute inset-0 h-full w-full" />
        <div className="relative z-20 flex w-full items-center">
          <div className=" justify-center items-center flex">
            <img src={getAssetUrl(GAME_ASSETS.diamond)} alt="Diamond Icon" />
          </div>
          <span className="pointer-events-none absolute ml-[10px] inset-0 flex items-center justify-center font-bold">
            {displayBalance}
          </span>
          <button className="ml-[40px] flex items-center justify-center size-[24px] rounded-full
leading-none px-[5px] bg-[radial-gradient(circle_at_50%_25%,#86efac,#22c55e,#14532d)]"
            onClick={() => onOpenModal("recharge")}>
            <span className="text-[20px] ">+</span>
          </button>
        </div>
      </button>
    </div>
  )
}
