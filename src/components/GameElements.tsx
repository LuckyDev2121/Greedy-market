import { useEffect } from 'react';
import { getAssetUrl, GAME_ASSETS } from "../config/gameConfig";
import { useGame, resolveAssetUrl } from '../hooks/useGameHook';

type FruitBoardProps = {
    controlButtons: "auto" | "none";
    currentBetAmount: number;
    displayedBets: Record<number, number>;
    onBetOption: (optionId: number, amount: number) => void;
    registerOptionRef?: (optionId: number, element: HTMLButtonElement | null) => void;
};

function formatNumber(num: number): string {
    if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1_000) {
        return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
}

const GameElements = ({ controlButtons, currentBetAmount, displayedBets, onBetOption, registerOptionRef }: FruitBoardProps) => {
    const { options, displayBalance } = useGame();

    useEffect(() => {
        if (!options.length) return;
        options.forEach((element) => {
            const img = new Image();
            img.src = resolveAssetUrl(element.logo);
        });
    }, [options]);

    const balance = Number.parseFloat(displayBalance ?? "0");

    return (
        <div className='relative top-[8px] h-[400px] w-[402px] z-30  left-1/2 transform -translate-x-1/2' style={{ pointerEvents: controlButtons }}>
            {options.map((element, index) => {
                let gridPosition = '';
                if (index === 0) gridPosition = 'top-[5px] left-[155px]';
                else if (index === 1) gridPosition = 'top-[25px] left-[262px]';
                else if (index === 2) gridPosition = 'top-[140px] left-[310px]';
                else if (index === 3) gridPosition = 'top-[245px] left-[262px]';
                else if (index === 4) gridPosition = 'top-[275px] left-[155px]';
                else if (index === 5) gridPosition = 'top-[245px] left-[50px]';
                else if (index === 6) gridPosition = 'top-[140px] left-[2px]';
                else if (index === 7) gridPosition = 'top-[25px] left-[50px]';
                const shownBetAmount = displayedBets[element.id] ?? 0;

                return (
                    <button
                        key={element.id}
                        ref={(node) => registerOptionRef?.(element.id, node)}
                        type="button"
                        disabled={controlButtons === "none" || balance < currentBetAmount}
                        style={{
                            cursor: controlButtons === "none" || balance < currentBetAmount ? 'default' : 'pointer',
                            touchAction: "manipulation",
                        }}
                        onPointerDown={() => onBetOption(element.id, currentBetAmount)}
                        className={`absolute ${gridPosition} w-[90px] h-[90px]`}
                    >
                        <img
                            src={resolveAssetUrl(element.logo)}
                            style={{ width: 70, height: 70 }}
                            className='absolute top-[4px] m-auto justify-center left-0 right-0'
                        />
                        <span className='absolute top-[60px] m-auto justify-center font-bold left-0 right-0 [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown]'>{element.name}</span>
                        {shownBetAmount > 0 && (
                            <div className='absolute h-[16px] w-[80px] top-[74px] left-[3px] flex items-center justify-center rounded-[8px] bg-gradient-to-t from-[#20bb2d] to-[#a9ff9d]'>
                                <img src={getAssetUrl(GAME_ASSETS.diamond)} alt="Diamond Icon" className="flex h-[30px] w-[30px]  " />
                                <span className='flex font-bold font-sans text-[#fac594] [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown]'>{formatNumber(shownBetAmount)}</span>
                            </div>
                        )}
                    </button>
                );
            })}
        </div >
    );
};

export default GameElements;
