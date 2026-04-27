import { useCallback, useEffect, useState } from "react";
import { echo,  } from "./echo";
import {
  fetchWinToday,
  fetchGameDetail,
  fetchPlayerInfo,
  fetchGameResults,
  createRound,
  fetchRechargeUrl,
  fetchSoundSetting,
  fetchMusicSetting,
  fetchRankingYesterday,
  placeBet as placeBetRequest,
  makeGameResult,
  saveSoundSetting,
  saveMusicSetting,
  fetchRankingToday,
  fetchCurrentMode,
  changeMode,
  fetchPrizeDistribution,
  fetchGetGift,
  fetchRemainingToday,
  fetchHistoryAdvance,
  fetchHistoryBasic,
  fetchMyRanking,
  fetchJackpot,
  type MyRanking,
  type History,
  type PrizeDistributionProps,
  type WinTodayResponse,
  type GameDetailsData,
  type PlayerDetailsData,
  type GameResults,
  type CreateRoundResponse,
  type ResultData,
  type PlaceBet,
  type RankingTodayItem,
  type RechargeUrlResponse,
  
} from "../api/api";
import {
  REALTIME_CHANNEL,
  REALTIME_EVENT,
  getAssetUrl,
} from "../config/gameConfig";
import { getUserId } from "../utils/user";

export function resolveAssetUrl(path: string): string {
  return getAssetUrl(path);
}

type GameStore = {
  gameDetails: GameDetailsData | null;
  playerInfo: PlayerDetailsData | null;
  results: GameResults | null;
  roundData: CreateRoundResponse | null;
  makeResult: ResultData | null;
  currentRoundBets: Record<number, number>;
  previousRoundBets: Record<number, number>;
  pendingBalanceDeduction: number;
  isLoading: boolean;
  lastBetMessage: string | null;
  isSoundEnabled: boolean;
  isSoundSettingLoading: boolean;
  isMusicEnabled: boolean;
  isMusicSettingLoading: boolean;
  rankingTodays: RankingTodayItem[];
  rankingYesterdays:RankingTodayItem[];
  winToday: WinTodayResponse|null;
  url?:RechargeUrlResponse | null;
  soundOverridden: boolean;
musicOverridden: boolean;
prizeDistribution:PrizeDistributionProps|null;
gameMode: string|null;
remaining:number;
basicHistory:History|null;
advanceHistory:History|null;
myRanking:MyRanking|null;
JackpotBasic:string|null;
JackpotAdvance:string|null;
};


const listeners = new Set<(state: GameStore) => void>();
let store: GameStore = {
  gameDetails: null,
  playerInfo: null,
  results: null,
  roundData: null,
  makeResult: null,
  currentRoundBets: {},
  previousRoundBets: {},
  pendingBalanceDeduction: 0,
  isLoading: true,
  lastBetMessage: null,
  isMusicSettingLoading: true,
  isMusicEnabled: true,
  isSoundSettingLoading: true,
  isSoundEnabled: true,
  rankingTodays: [],
  rankingYesterdays: [],
  winToday:null,
  url:null,
  soundOverridden: false,
musicOverridden: false,
prizeDistribution:null,
gameMode:null,
remaining:0,
basicHistory:null,
advanceHistory:null,
myRanking:null,
JackpotBasic: null,
JackpotAdvance:null,
};

let hasInitialized = false;

function emit() {
  listeners.forEach((listener) => listener(store));
}

function updateStore(
  partial: Partial<GameStore> | ((current: GameStore) => Partial<GameStore>),
) {
  const nextPartial = typeof partial === "function" ? partial(store) : partial;
  store = {
    ...store,
    ...nextPartial,
  };
  emit();
}

type RefreshGameDataOptions = {
  resetPendingBalanceDeduction?: boolean;
  preloadedGameDetail?: GameDetailsData;
};

async function loadOptionalData<T>(label: string, loader: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await loader();
  } catch (error) {
    console.error(`Failed to load ${label}`, error);
    return fallback;
  }
}

function formatBalanceValue(amount: number): string {
  if (Number.isNaN(amount) || amount <= 0) {
    return "0";
  }

  return Number.isInteger(amount)
    ? amount.toString()
    : amount.toFixed(2).replace(/\.?0+$/, "");
}

function normalizeBetRecord(
  options: GameDetailsData["options"],
  source: Record<number, number>,
): Record<number, number> {
  const normalized: Record<number, number> = {};

  options?.forEach((option) => {
    normalized[option.id] = source[option.id] ?? 0;
  });

  return normalized;
}

async function runRefreshGameData(options?: RefreshGameDataOptions) {
  updateStore({ isLoading: true, isMusicSettingLoading: true });

  try {
    const gameDetailPromise = options?.preloadedGameDetail
      ? Promise.resolve(options.preloadedGameDetail)
      : fetchGameDetail();

    const [jackpotBasic, jackpotAdvance, myRanking, basicHistory, advanceHistory, gameDetail, player, gameResults,  rankingToday, rankingYesterday,  winToday,  url, prizeDistribution, isSoundEnabled, isMusicEnabled, gameMode] = await Promise.all([
      loadOptionalData("basic jackpot", () => fetchJackpot("basic"), { status: true, mode: "basic", last_7_days_total: "0", message: "" }),
      loadOptionalData("advance jackpot", () => fetchJackpot("advance"), { status: true, mode: "advance", last_7_days_total: "0", message: "" }),
      loadOptionalData("my ranking", fetchMyRanking, { status: true, data: { ranking_position: 0, total_players: 0 }, message: "" }),
      loadOptionalData("basic history", fetchHistoryBasic, { status: true, count: 0, data: [], message: "" }),
      loadOptionalData("advance history", fetchHistoryAdvance, { status: true, count: 0, data: [], message: "" }),
      gameDetailPromise,
      fetchPlayerInfo(),
      fetchGameResults(),
      loadOptionalData("ranking today", fetchRankingToday, []),
      loadOptionalData("ranking yesterday", fetchRankingYesterday, []),
      loadOptionalData("win today", fetchWinToday, { status: true, user_id: 0, win: 0,win2:0, message: "" }),
      loadOptionalData("recharge url", fetchRechargeUrl, { status: true, message: "", url: "" }),
      loadOptionalData("prize distribution", fetchPrizeDistribution, { status: true, ranks: [], policy: [], message: "" }),
      loadOptionalData("sound setting", fetchSoundSetting, true),
      loadOptionalData("music setting", fetchMusicSetting, true),
      loadOptionalData("current mode", fetchCurrentMode, { status: true, message: "", data: { user_id: getUserId(), mode: "basic" } }),
    ]);

  updateStore({
    JackpotBasic:jackpotBasic.last_7_days_total,
    JackpotAdvance:jackpotAdvance.last_7_days_total,
    myRanking:myRanking,
    basicHistory:basicHistory,
    advanceHistory:advanceHistory,
    gameDetails: gameDetail,
  playerInfo: player,
  results: gameResults,
  isLoading: false,
  isSoundSettingLoading: false,
  isMusicSettingLoading: false,
  rankingTodays: rankingToday,
  rankingYesterdays: rankingYesterday,
  winToday:winToday,
  url: url,
  prizeDistribution:prizeDistribution,
    pendingBalanceDeduction: 0,
  previousRoundBets: normalizeBetRecord(gameDetail.options, store.previousRoundBets),
  isSoundEnabled,
  isMusicEnabled,
  gameMode:gameMode.data?.mode,
});
  } catch (error) {
    updateStore({ isLoading: false, isMusicSettingLoading: false, isSoundSettingLoading: false });
    throw error;
  }
}

function initializeStore() {
  if (hasInitialized) return;

  hasInitialized = true;

  const channel = echo.channel(REALTIME_CHANNEL);
  const eventName = `.${REALTIME_EVENT}`;

  channel.listen(eventName, async () => {
    await runRefreshGameData();
  });
}

export async function bootstrapGameStore(options?: RefreshGameDataOptions) {
  initializeStore();
  await runRefreshGameData(options);
}

export function useGame() {
  const [snapshot, setSnapshot] = useState({ ...store });

  useEffect(() => {
    initializeStore();

    const listener = (nextState: GameStore) => {
      setSnapshot({ ...nextState });
    };

    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const refreshGameData = useCallback(async (options?: RefreshGameDataOptions) => {
    await runRefreshGameData(options);
  }, []);

  const handleCreateRound = useCallback(async (mode: "basic" | "advance") => {
    const data = await createRound(mode);
    updateStore({ roundData: data });
    return data;
  }, []);


  const handleWinToday= useCallback(async () => {
    const data = await fetchWinToday();
    updateStore({ winToday: data });
    return data;
  }, []);

  const handleGetGift= useCallback(async (giftId:number) => {
    const data = await fetchGetGift(giftId);
    return data;
  }, []);


const handlePrizeDistribution= useCallback(async () => {
    const data = await fetchPrizeDistribution();
    updateStore({ prizeDistribution: data });
    return data;
  }, []);

  const handleRechargeRedirect = useCallback(async () => {
  try {
    const data = await fetchRechargeUrl();

    if (data.url && data.url.startsWith("http")) {
      updateStore({url:data});
      window.location.href = data.url;
    }
  } catch (error) {
    console.error(error);
  }
}, []);

  const handleGameRound = useCallback(async (roundId: number) => {
    const data = await makeGameResult(roundId);
    updateStore({
      makeResult: data,
    });

    return data;
  }, []);

  


  const handleMakeResult = useCallback(async (roundId: number) => {
    const data = await makeGameResult(roundId);
    const [myRanking, player, gameResults, rankingToday,rankingYesterday,  winToday, basicHistory, advanceHistory] = await Promise.all([
      loadOptionalData("my ranking", fetchMyRanking, { status: true, data: { ranking_position: 0, total_players: 0 }, message: "" }),
      fetchPlayerInfo(),
      fetchGameResults(),
      loadOptionalData("ranking today", fetchRankingToday, []),
      loadOptionalData("ranking yesterday", fetchRankingYesterday, []),
      loadOptionalData("win today", fetchWinToday, { status: true, user_id: 0, win: 0, win2:0, message: "" }),
      loadOptionalData("basic history", fetchHistoryBasic, { status: true, count: 0, data: [], message: "" }),
      loadOptionalData("advance history", fetchHistoryAdvance, { status: true, count: 0, data: [], message: "" }),
    ]);

    updateStore({
      myRanking: myRanking,
      makeResult: data,
      playerInfo: player,
      results: gameResults,
      rankingTodays: rankingToday,
      rankingYesterdays: rankingYesterday,
      winToday:winToday,
      basicHistory:basicHistory,
      advanceHistory:advanceHistory,
      pendingBalanceDeduction: 0,
    });

    return data;
  }, []);

  const handlePlaceBet = useCallback(async (optionId: number, amount: number,isAdvanceMode: boolean,) => {
	    let isMode='';
	    if(isAdvanceMode)isMode="advance"
	    else isMode="basic"
	    const currentBalance = Number.parseFloat(store.playerInfo?.balance ?? "0");

    if (currentBalance < amount) {
      throw new Error("Insufficient balance");
    }
	
	    const response: PlaceBet = await placeBetRequest(optionId, amount,isMode);
      const jackpot = await fetchJackpot(isMode);
	    updateStore((current) => ({
	      currentRoundBets: {
	        ...current.currentRoundBets,
	        [optionId]: (current.currentRoundBets[optionId] ?? 0) + amount,
	      },
	      lastBetMessage: response.message ?? null,
        JackpotAdvance: isMode === "advance" ? jackpot.last_7_days_total : current.JackpotAdvance,
        JackpotBasic: isMode === "basic" ? jackpot.last_7_days_total : current.JackpotBasic,
	    }));
	
	    return response;
	  }, []);

  const reserveBetBalance = useCallback((amount: number) => {
    if (amount <= 0) {
      return;
    }

    updateStore((current) => ({
      pendingBalanceDeduction: current.pendingBalanceDeduction + amount,
    }));
  }, []);

  const releaseBetBalance = useCallback((amount: number) => {
    if (amount <= 0) {
      return;
    }

    updateStore((current) => ({
      pendingBalanceDeduction: Math.max(0, current.pendingBalanceDeduction - amount),
    }));
  }, []);
 const handleSetSoundEnabled = useCallback(async (nextValue: boolean) => {
    
    await saveSoundSetting( nextValue);
    updateStore({ isSoundEnabled: nextValue });
  }, []);

const handleSetMusicEnabled = useCallback(async (nextValue: boolean) => {
    await saveMusicSetting( nextValue);
    updateStore({ isMusicEnabled: nextValue });
  }, []);
 
const handleChangeGameMode = useCallback(async (mode: "basic" | "advance") => {
   const response=await changeMode(mode);
    if (response.status) {
      updateStore({
        gameMode: mode,
        remaining: response.remaining ?? 0,
      });
      return response;
    }

    updateStore({
      remaining: response.remaining ?? 0,
    });
    return response
  }, []);

const handleGameMode= useCallback(async () => {
    const data = await fetchCurrentMode();
    updateStore({ gameMode: data.data?.mode
     });
    return data;
  }, []);
const handleRemainingToday= useCallback(async () => {
    const data = await fetchRemainingToday();
    return data;
  }, []);
  const clearCurrentRoundBets = useCallback(() => {
    updateStore({ currentRoundBets: {} });
  }, []);

  const archiveCurrentRoundBets = useCallback(() => {
    updateStore({
      previousRoundBets: normalizeBetRecord(
        store.gameDetails?.options,
        store.currentRoundBets,
      ),
    });
  }, []);

  const setPreviousRoundBets = useCallback((betMap: Record<number, number>) => {
    updateStore({
      previousRoundBets: normalizeBetRecord(
        store.gameDetails?.options,
        betMap,
      ),
    });
  }, []);

  const previousRoundBetEntries = (snapshot.gameDetails?.options ?? []).map((option) => ({
    option_id: option.id,
    amount: snapshot.previousRoundBets[option.id] ?? 0,
  }));

  const rawBalance = Number.parseFloat(snapshot.playerInfo?.balance ?? "0");
  const displayBalance = formatBalanceValue(
    Math.max(0, rawBalance - snapshot.pendingBalanceDeduction),
  );
const handleJackpot= useCallback(async (mode:string) => {
    const data = await fetchJackpot(mode);
    if(mode==="advance")
    updateStore({JackpotAdvance:data.last_7_days_total});
    else updateStore({JackpotBasic:data.last_7_days_total});
    return data;
  }, []);
  
  return {
    winToday: snapshot.winToday,
    betAmounts: snapshot.gameDetails?.bet_amounts ?? [],
    options: snapshot.gameDetails?.options ?? [],
    gift_boxes:snapshot.gameDetails?.gift_boxes??[],
    gameDetails: snapshot.gameDetails,
    playerInfo: snapshot.playerInfo,
    displayBalance,
    results: snapshot.results,
    roundData: snapshot.roundData,
    makeResult: snapshot.makeResult,
    currentRoundBets: snapshot.currentRoundBets,
    previousRoundBets: snapshot.previousRoundBets,
    previousRoundBetEntries,
    isLoading: snapshot.isLoading,
    lastBetMessage: snapshot.lastBetMessage,
    isMusicEnabled: snapshot.isMusicEnabled,
    isMusicSettingLoading: snapshot.isMusicSettingLoading,
    isSoundEnabled: snapshot.isSoundEnabled,
    isSoundSettingLoading: snapshot.isSoundSettingLoading,
    rankingToday: snapshot.rankingTodays,
    rankingYesterday: snapshot.rankingYesterdays,
    rechargeUrl: snapshot.url?.url || null,
    prizeDistribution:snapshot.prizeDistribution,
    gameMode:snapshot.gameMode,
    basicHistory:snapshot.basicHistory,
    advanceHistory:snapshot.advanceHistory,
    myRanking:snapshot.myRanking,
    JackpotAdvance:snapshot.JackpotAdvance,
    JackpotBasic:snapshot.JackpotBasic,
    refreshGameData,
    createRound: handleCreateRound,
    makeGameRound:handleGameRound,
    makeGameResult: handleMakeResult,
    placeBet: handlePlaceBet,
    reserveBetBalance,
    releaseBetBalance,
    setMusicEnabled: handleSetMusicEnabled,
    setSoundEnabled: handleSetSoundEnabled,
    setGameMode:handleChangeGameMode,
    clearCurrentRoundBets,
    archiveCurrentRoundBets,
    setPreviousRoundBets,
    handleWinToday,
    handleRechargeRedirect,
    handlePrizeDistribution,
    handleGameMode,
    handleGetGift,
    handleRemainingToday,
handleJackpot
  };
}
