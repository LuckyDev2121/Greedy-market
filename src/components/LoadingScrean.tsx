import { getAssetUrl, GAME_ASSETS } from "../config/gameConfig";

type LoadingScreenProps = {
    progress: number;
    onUnlockAudio?: () => void;
    showUnlockHint?: boolean;
};

export default function LoadingScreen({
    progress,
    onUnlockAudio,
    showUnlockHint = false,
}: LoadingScreenProps) {
    return (
        <button
            type="button"
            onClick={onUnlockAudio}
            onTouchStart={onUnlockAudio}
            className=" h-svh w-full text-left"
        >
            <div className="absolute flex inset-0 items-center justify-center">
                <img src={getAssetUrl(GAME_ASSETS.normalBg)} alt="normal" />
                <div className="absolute inset-0 bg-blue-500/30 mix-blend-normal" />
            </div>
            <div className="absolute  inset-0 z-[200] flex-col flex left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[200px] rounded-[40px] border-blue-950 items-center justify-center px-6">
                <div className="w-[100px] h-[100px] ">
                    <img src={getAssetUrl(GAME_ASSETS.logo)} alt="Loading" />
                </div>
                <div className="h-[16px] w-full bg-gray-300/50 rounded-full">
                    <div
                        className="h-[16px] bg-gradient-to-t from-[#076879] to-[#0CC0DF] rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                {showUnlockHint ? (
                    <p className="mt-4 text-center text-sm font-semibold text-white">
                        Tap to enable sound
                    </p>
                ) : null}
            </div>
        </button>
    );
}
