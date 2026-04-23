import { useCallback, useEffect, useState } from "react";
import { echo,  } from "./echo";
import {
  fetchPlayerLog,
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
  type PrizeDistributionProps,
  type PlayerLogData,
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
  playerLog: PlayerLogData[];
  url?:RechargeUrlResponse | null;
  soundOverridden: boolean;
musicOverridden: boolean;
prizeDistribution:PrizeDistributionProps|null;
gameMode: string|null;
remaining:number;
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
  playerLog:[],
  url:null,
  soundOverridden: false,
musicOverridden: false,
prizeDistribution:null,
gameMode:null,
remaining:0,
  // runtimeConfig: { backendOrigin: "", apiBaseUrl: "" },
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
};

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
    const [gameDetail, player, gameResults,  rankingToday, rankingYesterday,  winToday, playerLog, url, prizeDistribution, isSoundEnabled, isMusicEnabled, gameMode] = await Promise.all([
      fetchGameDetail(),
      fetchPlayerInfo(),
      fetchGameResults(),
      fetchRankingToday(),
      fetchRankingYesterday(),
      fetchWinToday(),
      fetchPlayerLog(),
      fetchRechargeUrl(),
      fetchPrizeDistribution(),
      fetchSoundSetting(),
      fetchMusicSetting(),
      fetchCurrentMode(),
    ]);

  updateStore({
  gameDetails: gameDetail,
  playerInfo: player,
  results: gameResults,

  isLoading: false,
  isSoundSettingLoading: false,
  isMusicSettingLoading: false,
  rankingTodays: rankingToday,
  rankingYesterdays: rankingYesterday,
  playerLog:playerLog,
  winToday:winToday,
  url: url,
  prizeDistribution:prizeDistribution,
    pendingBalanceDeduction: options?.resetPendingBalanceDeduction
      ? 0
      : store.pendingBalanceDeduction,
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

  const handleCreateRound = useCallback(async () => {
    const data = await createRound();
    updateStore({ roundData: data });
    return data;
  }, []);

  const handlePlayerLog = useCallback(async () => {
    const data = await fetchPlayerLog();
    updateStore({ playerLog: data });
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
    const [player, gameResults, rankingToday,rankingYesterday, playerLog, winToday] = await Promise.all([
      fetchPlayerInfo(),
      fetchGameResults(),
      fetchRankingToday(),
      fetchRankingYesterday(),
      fetchPlayerLog(),
      fetchWinToday(),
    ]);

    updateStore({
      makeResult: data,
      playerInfo: player,
      results: gameResults,
      rankingTodays: rankingToday,
      rankingYesterdays: rankingYesterday,
      playerLog:playerLog,
      winToday:winToday,
    });

    return data;
  }, []);

  const handlePlaceBet = useCallback(async (optionId: number, amount: number) => {
    const currentBalance = Number.parseFloat(store.playerInfo?.balance ?? "0");

    if (currentBalance < amount) {
      throw new Error("Insufficient balance");
    }

    const response: PlaceBet = await placeBetRequest(optionId, amount);
    updateStore((current) => ({
      currentRoundBets: {
        ...current.currentRoundBets,
        [optionId]: (current.currentRoundBets[optionId] ?? 0) + amount,
      },
      lastBetMessage: response.message ?? null,
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
 
  const handleChangeGameMode = useCallback(async (isAdvanceMode: boolean) => {
    let isMode='';
    if(isAdvanceMode)isMode="basic"
    else isMode="advance"
   const response=await changeMode(isMode);
    if (response.status) {
      updateStore({
        gameMode: isMode,
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

  return {
    playerLog: snapshot.playerLog ?? [],
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
    handlePlayerLog,
    handleWinToday,
    handleRechargeRedirect,
    handlePrizeDistribution,
    handleGameMode,
    handleGetGift,
    handleRemainingToday,
  };
}
