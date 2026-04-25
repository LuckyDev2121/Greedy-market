import { useState, useEffect } from "react";
import { getAssetUrl, GAME_ASSETS } from "../config/gameConfig";
import { useGame, resolveAssetUrl } from "../hooks/useGameHook";
import RankingHelpModal from "./RankingHelpModal";
type CupMenuProps = {
    onCloseCup: () => void;
    onOpenModal: (modal: string) => void;
};
type ToggleRowProps = {
    isOn: boolean;
    onToggle: () => void;
};
function QuestionMarkIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <path
                d="M5.55 5.4C5.55 4.35 6.4 3.5 7.45 3.5C8.5 3.5 9.35 4.25 9.35 5.2C9.35 5.95 8.95 6.45 8.25 6.9C7.6 7.3 7.2 7.7 7.2 8.45V8.7"
                stroke="brown"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="7.2" cy="11.1" r="0.8" fill="brown" />
        </svg>
    );
}

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
function ToggleRow({ isOn, onToggle }: ToggleRowProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex h-[26px] w-[172px] overflow-hidden rounded-full border bg-gradient-to-t bg-[#e49236]/60 border-[#b4870a]  text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]">
                <button
                    type="button"
                    onClick={isOn ? onToggle : undefined}
                    className={`h-full flex-1 text-[10px] font-bold [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown] leading-none transition ${isOn ? "bg-transparent  " : "bg-gradient-to-t from-[#FFDB19] to-[#E09613] rounded-full"}`}
                >
                    Today
                </button>
                <button
                    type="button"
                    onClick={isOn ? undefined : onToggle}
                    className={`h-full flex-1 text-[10px] font-bold [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown] leading-none transition ${isOn ? "bg-gradient-to-t from-[#FFDB19] to-[#E09613] rounded-full  " : "bg-transparent text-white "}`}
                >
                    Yesterday
                </button>
            </div>
        </div>
    );
}
export default function CupMenu({ onCloseCup }: CupMenuProps) {
    const [isRankingHelpOpen, setIsRankingHelpOpen] = useState(false);
    const [isYesterdayRanking, setIsYesterdayRanking] = useState(false);
    const [result, setResult] = useState(0);
    const { rankingToday, rankingYesterday, handleRemainingToday, myRanking, winToday, playerInfo } = useGame();
    const [time, setTime] = useState("");
    useEffect(() => {
        const load = async () => {
            const data = await handleRemainingToday();
            setResult(Math.floor(Number(data.data.remaining_seconds)));
        };
        void load();
    }, []);

    useEffect(() => {
        if (!result) return;

        const updateTime = () => {
            const res = result;
            const hours = Math.floor(res / 3600);
            const minutes = Math.floor((res % 3600) / 60);
            const seconds = res % 60;

            setTime(
                `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
                    .toString()
                    .padStart(2, "0")}`
            );
        };

        updateTime();

        const interval = setInterval(() => {
            setResult((prev) => {
                const next = prev - 1;
                return next >= 0 ? next : 0;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [result]);

    return (
        <div className="absolute h-[556px] bg-[#fa9c10] w-[374px] rounded-[20px]">
            <div className="absolute h-[536px] bg-[#fadbad] w-[354px] rounded-[20px] left-1/2 -translate-x-1/2 top-[10px] border-[1px] border-l-amber-900 border-b=-amber-900">
                <img src={getAssetUrl(GAME_ASSETS.rebons)} alt="leaderPart" className="absolute left-1/2 -translate-x-1/2 -top-[90px]" />
                <span className="absolute left-1/2 -translate-x-1/2 -top-[30px]  text-[25px] text-[#ffd991] [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown]">Game Rank</span>
                <div className="absolute left-1/2 top-[25px] flex h-[20px] w-[140px] -translate-x-1/2 items-center justify-center rounded-full bg-[#976507]">
                    <span className="text-[12px] font-bold ">{isYesterdayRanking ? "Yesterday Ranking" : time}</span>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-[50px]">
                    <ToggleRow isOn={isYesterdayRanking} onToggle={() => setIsYesterdayRanking(!isYesterdayRanking)} />
                </div>
                <button className="absolute -right-[20px] -top-[30px] h-[30px] w-[30px] mt-[9px] pl-[7px]  rounded-full bg-[#ee3333]" onClick={onCloseCup}>
                    <CloseIcon />
                </button>
                <button className="absolute h-[26px] w-[26px] mt-[5px] pl-[4px] top-[35px] right-[47px] border-[1px] border-[brown] rounded-full bg-[#ffd884]" onClick={() => setIsRankingHelpOpen(true)}>
                    <QuestionMarkIcon />
                </button>
                <div className="absolute w-[326px] h-[446px] top-[80px] left-1/2 -translate-x-1/2 bg-[#d49440] rounded-[20px]">
                    <div className="flex items-center w-[280px] bg-[#ec7e00]">
                        <span className="absolute left-[20px] top-[5px] font-bold font-sans">Ranking</span>
                        <span className=" absolute left-[120px] top-[5px] font-bold font-sans">Name</span>
                        <span className=" absolute left-[200px] top-[5px] font-bold font-sans">Diamonds Play</span>
                    </div>
                    <div className="absolute top-[35px] w-[292px] h-[411px] left-1/2 -translate-x-1/2 scrollbar-hidden overflow-x-hidden overflow-y-auto">
                        {isYesterdayRanking ?
                            (rankingYesterday.map((item, index) => {
                                return (
                                    <>
                                        {index === 0 && (
                                            <div className="relative w-[312px] h-[47px] mt-[5px]  ">
                                                <div className="absolute left-[0px] h-[47px] w-[47px] bg-gradient-to-br from-[#cf9800] from-1%  via-50% via-[#FFF987] to-[#fdc21f] to-90% rounded-l-[10px]">
                                                    <img src={getAssetUrl(GAME_ASSETS.prize1)} alt="prize" className=" absolute h-[35px] w-[35px] left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2" />
                                                </div>
                                                <div className="absolute left-[47px] flex h-[47px] w-[245px] bg-gradient-to-t from-[#FBBA07]   to-[#FFF987] items-center rounded-r-[10px]">
                                                    <img src={resolveAssetUrl(item.player?.avater ?? "")} alt="avatar" className="h-[45px] w-[45px] rounded-full" />
                                                    <span className="absolute left-[50px]  content-center text-[#ffd991]  [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown] font-bold  h-[40px] w-[80px]">{item.player?.username}</span>
                                                    <img src={getAssetUrl(GAME_ASSETS.diamond)} alt="diamond" className="absolute left-[130px] h-[40px] w-[40px]" />
                                                    <span className="absolute left-[160px] text-[#fde4c7] [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown] font-bold  h-[40px] w-[80px] content-center">{parseFloat(item.total_win).toString()}</span>
                                                </div>
                                            </div>
                                        )}
                                        {index === 1 && (
                                            <div className="relative w-[292px] h-[47px] mt-[5px] flex">
                                                <div className="relative h-[47px] w-[47px] bg-gradient-to-br from-[#44aedf] from-1%  via-50% via-[#b8d6f8] to-[#72ccf7] to-90% rounded-l-[10px]">
                                                    <img src={getAssetUrl(GAME_ASSETS.prize2)} alt="prize" className="absolute h-[35px] w-[35px] left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 " />
                                                </div>
                                                <div className="relative flex h-[47px] w-[245px] bg-gradient-to-t from-[#7fd5fd]   to-[#b8d6f8] items-center rounded-r-[10px]">
                                                    <img src={resolveAssetUrl(item.player?.avater ?? "")} alt="avatar" className="h-[45px] w-[45px] rounded-full" />
                                                    <span className="absolute left-[50px] [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown] text-[#fde4c7] font-bold  h-[40px] w-[80px] content-center">{item.player?.username}</span>
                                                    <img src={getAssetUrl(GAME_ASSETS.diamond)} alt="diamond" className="absolute left-[130px] h-[40px] w-[40px]" />
                                                    <span className="absolute left-[160px] [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown] text-[#fde4c7] font-bold  h-[40px] w-[80px] content-center">{parseFloat(item.total_win).toString()}</span>
                                                </div>
                                            </div>
                                        )}
                                        {index === 2 && (
                                            <div className="relative w-[292px] h-[47px] mt-[5px] flex">
                                                <div className="relative h-[47px] w-[47px] bg-gradient-to-br from-[#d47e37] from-1%  via-50% via-[#fec79a] to-[#eea162] to-90% rounded-l-[10px]">
                                                    <img src={getAssetUrl(GAME_ASSETS.prize3)} alt="prize2" className="absolute h-[35px] w-[35px] left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2" />
                                                </div>
                                                <div className="relative flex h-[47px] w-[245px] bg-gradient-to-t from-[#f1a362]   to-[#fec79a] items-center rounded-r-[10px]">
                                                    <img src={resolveAssetUrl(item.player?.avater ?? "")} alt="avatar" className="h-[45px] w-[45px] rounded-full" />
                                                    <span className="absolute [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown] left-[50px] text-[#fde4c7] font-bold  h-[40px] w-[80px] content-center">{item.player?.username}</span>
                                                    <img src={getAssetUrl(GAME_ASSETS.diamond)} alt="diamond" className="absolute left-[130px] h-[40px] w-[40px]" />
                                                    <span className="absolute [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown] left-[160px] text-[#fde4c7] font-bold  h-[40px] w-[80px] content-center">{parseFloat(item.total_win).toString()}</span>
                                                </div>
                                            </div>
                                        )}
                                        {index > 2 && (
                                            <div className="relative w-[292px] h-[47px] mt-[5px] flex">
                                                <div className="relative content-center pl-[20px] h-[47px] w-[47px] text-[#ffcf68] text-[20px] bg-[#ffe2ad] [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown] rounded-l-[10px]">
                                                    {index}
                                                </div>
                                                <div className="relative flex h-[47px] w-[245px] bg-gradient-to-t from-[#d6b579]   to-[#fffae6] items-center rounded-r-[10px]">
                                                    <img src={resolveAssetUrl(item.player?.avater ?? "")} alt="avatar" className="h-[45px] w-[45px] rounded-full" />
                                                    <span className="absolute [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown] left-[50px] text-[#fde4c7] font-bold  h-[40px] w-[80px] content-center">{item.player?.username}</span>
                                                    <img src={getAssetUrl(GAME_ASSETS.diamond)} alt="diamond" className="absolute left-[130px] h-[40px] w-[40px]" />
                                                    <span className="absolute [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown] left-[160px] text-[#fde4c7] font-bold  h-[40px] w-[80px] content-center">{parseFloat(item.total_win).toString()}</span>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                );
                            }))
                            : (rankingToday.map((item, index) => {
                                return (
                                    <>
                                        {index === 0 && (
                                            <div className="relative w-[312px] h-[47px] mt-[5px]  ">
                                                <div className="absolute left-[0px] h-[47px] w-[47px] bg-gradient-to-br from-[#cf9800] from-1%  via-50% via-[#FFF987] to-[#fdc21f] to-90% rounded-l-[10px]">
                                                    <img src={getAssetUrl(GAME_ASSETS.prize1)} alt="prize" className=" absolute h-[35px] w-[35px] left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2" />
                                                </div>
                                                <div className="absolute left-[47px] flex h-[47px] w-[245px] bg-gradient-to-t from-[#FBBA07]   to-[#FFF987] items-center rounded-r-[10px]">
                                                    <img src={resolveAssetUrl(item.player?.avater ?? "")} alt="avatar" className="h-[45px] w-[45px] rounded-full" />
                                                    <span className="absolute [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown] left-[50px] text-[#fde4c7] font-bold  h-[40px] w-[80px] content-center">{item.player?.username}</span>
                                                    <img src={getAssetUrl(GAME_ASSETS.diamond)} alt="diamond" className="absolute left-[130px] h-[40px] w-[40px]" />
                                                    <span className="absolute [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown] left-[160px] text-[#fde4c7] font-bold  h-[40px] w-[80px] content-center">{parseFloat(item.total_win).toString()}</span>
                                                </div>
                                            </div>
                                        )}
                                        {index === 1 && (
                                            <div className="relative w-[292px] h-[47px] mt-[5px] flex">
                                                <div className="relative h-[47px] w-[47px] bg-gradient-to-br from-[#44aedf] from-1%  via-50% via-[#b8d6f8] to-[#72ccf7] to-90% rounded-l-[10px]">
                                                    <img src={getAssetUrl(GAME_ASSETS.prize2)} alt="prize" className="absolute h-[35px] w-[35px] left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 " />
                                                </div>
                                                <div className="relative flex h-[47px] w-[245px] bg-gradient-to-t from-[#7fd5fd]   to-[#b8d6f8] items-center rounded-r-[10px]">
                                                    <img src={resolveAssetUrl(item.player?.avater ?? "")} alt="avatar" className="h-[45px] w-[45px] rounded-full" />
                                                    <span className="absolute [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown] left-[50px] text-[#fde4c7] font-bold  h-[40px] w-[80px] content-center">{item.player?.username}</span>
                                                    <img src={getAssetUrl(GAME_ASSETS.diamond)} alt="diamond" className="absolute left-[130px] h-[40px] w-[40px]" />
                                                    <span className="absolute [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown] left-[160px] text-[#fde4c7] font-bold  h-[40px] w-[80px] content-center">{parseFloat(item.total_win).toString()}</span>
                                                </div>
                                            </div>
                                        )}
                                        {index === 2 && (
                                            <div className="relative w-[292px] h-[47px] mt-[5px] flex">
                                                <div className="relative h-[47px] w-[47px] bg-gradient-to-br from-[#d47e37] from-1%  via-50% via-[#fec79a] to-[#eea162] to-90% rounded-l-[10px]">
                                                    <img src={getAssetUrl(GAME_ASSETS.prize3)} alt="prize2" className="absolute h-[35px] w-[35px] left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2" />
                                                </div>
                                                <div className="relative flex h-[47px] w-[245px] bg-gradient-to-t from-[#f1a362]   to-[#fec79a] items-center rounded-r-[10px]">
                                                    <img src={resolveAssetUrl(item.player?.avater ?? "")} alt="avatar" className="h-[45px] w-[45px] rounded-full" />
                                                    <span className="absolute [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown] left-[50px] text-[#fde4c7] font-bold  h-[40px] w-[80px] content-center">{item.player?.username}</span>
                                                    <img src={getAssetUrl(GAME_ASSETS.diamond)} alt="diamond" className="absolute left-[130px] h-[40px] w-[40px]" />
                                                    <span className="absolute [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown] left-[160px] text-[#fde4c7] font-bold  h-[40px] w-[80px] content-center">{parseFloat(item.total_win).toString()}</span>
                                                </div>
                                            </div>
                                        )}
                                        {index > 2 && (
                                            <div className="relative w-[292px] h-[47px] mt-[5px] flex">
                                                <div className="relative content-center pl-[20px] h-[47px] w-[47px] text-[#ffcf68] text-[20px] bg-[#ffe2ad] [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown] rounded-l-[10px]">
                                                    {index}
                                                </div>
                                                <div className="relative flex h-[47px] w-[245px] bg-gradient-to-t from-[#d6b579]   to-[#fffae6] items-center rounded-r-[10px]">
                                                    <img src={resolveAssetUrl(item.player?.avater ?? "")} alt="avatar" className="h-[45px] w-[45px] rounded-full" />
                                                    <span className="absolute [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown] left-[50px] text-[#fde4c7] font-bold  h-[40px] w-[80px] content-center">{item.player?.username}</span>
                                                    <img src={getAssetUrl(GAME_ASSETS.diamond)} alt="diamond" className="absolute left-[130px] h-[40px] w-[40px]" />
                                                    <span className="absolute [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown] left-[160px] text-[#fde4c7] font-bold  h-[40px] w-[80px] content-center">{parseFloat(item.total_win).toString()}</span>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                );
                            }))}
                    </div>
                </div>
                <div className="absolute flex items-center top-[480px] left-1/2 -translate-x-1/2 w-[346px] h-[48px] bg-gradient-to-br bg-[#fcbd5f] rounded-[9px]">
                    {myRanking?.data.ranking_position && myRanking?.data.ranking_position === 0 && (
                        <div className="absolute left-0 top-0 h-[48px] w-[48px] bg-[#ffaa2c] rounded-l-[9px]">
                            <span className="absolute text-[#FDF4C1]  font-bold text-[16px] top-1/2 -translate-y-1/2  [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown]">+99</span>
                        </div>
                    )}
                    {myRanking?.data.ranking_position && myRanking?.data.ranking_position === 1 && (
                        <div className="h-[48px] w-[48px] bg-[#ffaa2c] rounded-l-[9px]">
                            <img src={getAssetUrl(GAME_ASSETS.prize1)} alt="prize" className=" absolute h-[45px] w-[45px] top-1/2 -translate-y-1/2" />
                        </div>
                    )}
                    {myRanking?.data.ranking_position && myRanking?.data.ranking_position === 2 && (
                        <div className="h-[48px] w-[48px] bg-[#ffaa2c] rounded-l-[9px]">
                            <img src={getAssetUrl(GAME_ASSETS.prize2)} alt="prize" className=" absolute h-[45px] w-[45px] top-1/2 -translate-y-1/2 " />
                        </div>
                    )}
                    {myRanking?.data.ranking_position && myRanking?.data.ranking_position === 3 && (
                        <div className="h-[48px] w-[48px] bg-[#ffaa2c] rounded-l-[9px]">
                            <img src={getAssetUrl(GAME_ASSETS.prize3)} alt="prize" className=" absolute h-[45px] w-[45px] top-1/2 -translate-y-1/2 " />
                        </div>
                    )}
                    {myRanking?.data.ranking_position && myRanking?.data.ranking_position > 3 && myRanking?.data.ranking_position < 99 && (
                        <div className="absolute left-0 top-0 h-[48px] w-[48px] bg-[#ffaa2c] rounded-l-[9px]">
                            <span className="absolute text-[#FDF4C1]  font-bold text-[16px] top-1/2 -translate-y-1/2  [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown]">{myRanking?.data.ranking_position}</span>
                        </div>
                    )}
                    {myRanking?.data.ranking_position && (myRanking?.data.ranking_position > 98 || myRanking?.data.ranking_position === 0) && (
                        <div className="absolute left-0 top-0 h-[48px] w-[48px] bg-[#ffaa2c] rounded-l-[9px]">
                            <span className="absolute text-[#FDF4C1]  font-bold text-[16px] top-1/2 -translate-y-1/2  [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown]">+99</span>
                        </div>
                    )}
                    <img src={resolveAssetUrl(playerInfo?.avater ?? "")} alt="avatar" className="absolute left-[50px]  h-[45px] w-[45px] rounded-full" />
                    <span className="absolute  text-[#A45721] font-bold left-[100px]">{playerInfo?.username}</span>
                    <img src={getAssetUrl(GAME_ASSETS.diamond)} alt="diamond" className="absolute left-[220px] h-[40px] w-[40px]" />
                    <span className="absolute left-[260px] [text-shadow:1px_0_0_brown,-1px_0_0_brown,0_1px_0_brown,0_-1px_0_brown] text-[#fde4c7] font-bold  h-[40px] w-[80px] content-center">{Number(winToday?.win).toString()}</span>
                </div>
                {isRankingHelpOpen && (
                    <>
                        <div className="absolute inset-0 z-[60] rounded-t-[20px] bg-black/30" />
                        <div className="absolute left-1/2 -top-[50px] z-[70] -translate-x-1/2 ">
                            <RankingHelpModal
                                onCloseRankingHelpModal={() => setIsRankingHelpOpen(false)}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

