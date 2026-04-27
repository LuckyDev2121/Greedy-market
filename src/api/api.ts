import axios from "axios";
import {
  GAME_ID,
  GAME_DETAILS_API_URL,
  PLAYER_API_URL,
  GAME_RESULTS_API_URL,
  PLACE_BET_API_URL,
  CURRENT_ROUND_API_URL,
  ROUND_RESULT_API_URL,
  SOUND_SETTING_API_URL,
  MUSIC_SETTING_API_URL,
  RANKING_TODAY_API_URL,
  WIN_TODAY_API_URL,
  PLAYER_LOG_API_URL,
  RECHARGE_URL_API_URL,
  CURRENT_MODE_API_URL,
  CHANGE_MODE_API_URL,
  PRIZE_DISTRIBUTIONS_API_URL,
  GET_GIFT_API_URL,
  RANKING_YESTERDAY_API_URL,
  REMAINING_API_URL,
  HISTORY_API_URL,
  MY_RANKING_API_URL,
  JACKPOT_FIRE_API_URL,
} from "../config/gameConfig";
import { getUserId } from "../utils/user";

function isNoRecordsResponse(status?: boolean, message?: string): boolean {
  return status === false && /no records found/i.test(message ?? "");
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const apiMessage =
      typeof error.response?.data?.message === "string"
        ? error.response.data.message
        : undefined;

    return apiMessage || error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

type GameOption = {
  id: number;
  name: string;
  logo: string;
};

type BetAmount = {
  id: number;
  amount: string;
  mode:string;
  icon: string;
};

type HowToPlay = {
  rules?: string;
};
type giftBox={
  mode: string;
  id:number;
  amount: string;
  gift_amount:number;
  box_closed: string;
  box_opened:string;
  is_claimed:boolean;
}
export type GameDetailsData = {
  id?: number;
  name?: string;
  how_to_play?: HowToPlay;
  options?: GameOption[];
  bet_amounts?: BetAmount[];
  gift_boxes_asset_base_path:string;
  gift_boxes:giftBox[];
};

type GameDetails = {
  status?: boolean;
  data?: GameDetailsData;
  message?: string;
};

export const fetchGameDetail = async (): Promise<GameDetailsData> => {
  const response = await axios.get<GameDetails>(GAME_DETAILS_API_URL);
console.log("res:",response)
  if (!response.data.status) {
    throw new Error(response.data.message || "API returned false status");
  }

  return response.data.data as GameDetailsData;
};


export type PlayerDetailsData = {
  id?: number;
  username?: string;
  avater?: string;
  balance?: string;
};

type PlayerDetails = {
  status?: boolean;
  data?: PlayerDetailsData;
  message?: string;
};

export const fetchPlayerInfo = async (): Promise<PlayerDetailsData> => {
  const response = await axios.get<PlayerDetails>(`${PLAYER_API_URL}/${getUserId()}`);
  if (!response.data.status) {
    throw new Error(response.data.message || "API returned false status");
  }

  return response.data.data as PlayerDetailsData;
};

type GameResultItem = {
  option_id: number;
  option_name: string;
  is_jackpot:number;
};

export type GameResults = {
  status?: boolean;
  data?: GameResultItem[];
  message?: string;
};

export const fetchGameResults = async (): Promise<GameResults> => {
  const response = await axios.get<GameResults>(GAME_RESULTS_API_URL);

  if (isNoRecordsResponse(response.data.status, response.data.message)) {
    return {
      status: true,
      data: [],
      message: response.data.message,
    };
  }

  if (!response.data.status) {
    throw new Error(response.data.message || "API returned false status");
  }

  return response.data;
};

export type PlaceBet = {
  status?: boolean;
  message?: string;
};

export const placeBet = async (betId: number, amount: number,isMode: string,): Promise<PlaceBet> => {
  const response = await axios.post<PlaceBet>(PLACE_BET_API_URL, {
    game_id: GAME_ID,
    option_id: betId,
    amount: amount,
    user_id: getUserId(),
    mode:isMode,
  });

  if (!response.data.status) {
    throw new Error(response.data.message || "Failed to place bet");
  }

  return response.data;
};
  
type Winners = {
  id: number;
  username: string;
  avater: string;
  win_amount: number;
}
export type ResultData = {
  round_id: number;
  round_no: number;
  winning_option_id: number[];
  winners: Winners[];
  jackpot_avatar?: string;
};

type RawResultData = {
  round_id: number;
  round_no: number;
  winning_option_id: number | number[];
  winners: Winners[];
};

export type MakeResultResponse = {
  status: boolean;
  message: string;
  jackpot_avatar?:string;
  data?: RawResultData;
};

export const makeGameResult = async (roundId: number): Promise<ResultData> => {
    const response = await axios.post<MakeResultResponse>(ROUND_RESULT_API_URL, {
      game_id: GAME_ID,
      round_no: roundId,
    });

  if (!response.data.status) {
    throw new Error(response.data.message || "Failed to make game result");
  }
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to make game result");
  }

  const raw = response.data.data;

  const normalizedWinningIds = Array.isArray(raw.winning_option_id)
    ? raw.winning_option_id.map(Number)
    : [raw.winning_option_id];

     return {
    round_id: raw.round_id,
    round_no: raw.round_no,
    winning_option_id: normalizedWinningIds,
    winners: raw.winners,
    jackpot_avatar: response.data.jackpot_avatar, // ✅ merge here
  };
};

export type CreateRoundResponse = {
  game_id: number;
  round_no: number;
  remaining_seconds: number;
  stage: string;
};

export const createRound = async ( isMode: string,): Promise<CreateRoundResponse> => {
    const response = await axios.get<CreateRoundResponse>(`${CURRENT_ROUND_API_URL}/${isMode}`);
  
  if (!response.data) {
    throw new Error(response.data || "Failed to load sound setting");
  }

  return response.data;
}

export type CurrentData={
  user_id?: number;
  mode?: string;
}

export type CurrentModeProps={
  status?:boolean;
  message?:string;
  data?:CurrentData;
}

export const fetchCurrentMode=async (): Promise<CurrentModeProps> => {
  const response = await axios.get<CurrentModeProps>(`${CURRENT_MODE_API_URL}/${getUserId()}`);
  if (!response.data.status) {
    throw new Error(response.data.message || "API returned false status");
  }

  return response.data;
};

export type ChangeMode={
  status:boolean;
  message: string;
  remaining?:number;
}

export const changeMode = async (
  isMode: string,
): Promise<ChangeMode> => {
  try {
    const response = await axios.post<ChangeMode>(CHANGE_MODE_API_URL, {
      mode: isMode,
      game_id: GAME_ID,
      user_id: getUserId(),
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError<ChangeMode>(error) && error.response?.data) {
      return error.response.data;
    }

    throw error;
  }
};




type SoundSettingResponse = {
  status?: boolean;
  data?: number;
  message?: string;
};

export const fetchSoundSetting = async (): Promise<boolean> => {
  const response = await axios.get<SoundSettingResponse>(`${SOUND_SETTING_API_URL}/${GAME_ID}/${getUserId()}`);
  if (!response.data.status) {
    throw new Error(response.data.message || "Failed to load sound setting");
  }

  return response.data.data === 1;
};

type SaveSoundSettingResponse = {
  status?: boolean;
  message?: string;
};

export const saveSoundSetting = async (
  isSoundOn: boolean,
): Promise<SaveSoundSettingResponse> => {
  const response = await axios.post<SaveSoundSettingResponse>(SOUND_SETTING_API_URL, {
    game_id: GAME_ID,
    user_id: getUserId(),
    status: isSoundOn ? 1 : 0,
  });
  if (!response.data.status) {
    throw new Error(response.data.message || "Failed to save sound setting");
  }

  return response.data;
};

type MusicSettingResponse = {
  status?: boolean;
  data?: number;
  message?: string;
};

export const fetchMusicSetting = async (): Promise<boolean> => {
  const response = await axios.get<MusicSettingResponse>(`${MUSIC_SETTING_API_URL}/${GAME_ID}/${getUserId()}`);

  if (!response.data.status) {
    throw new Error(response.data.message || "Failed to load music setting");
  }
  return response.data.data === 1;
};

type SaveMusicSettingResponse = {
  status?: boolean;
  message?: string;
};

export const saveMusicSetting = async (
  isMusicOn: boolean,
): Promise<SaveMusicSettingResponse> => {
  const response = await axios.post<SaveMusicSettingResponse>(MUSIC_SETTING_API_URL, {
    game_id: GAME_ID,
    user_id: getUserId(),
    status: isMusicOn ? 1 : 0,
  });
  if (!response.data.status) {
    throw new Error(response.data.message || "Failed to save music setting");
  }

  return response.data;
};

export type RankingTodayItem = {
  player_id: number;
  total_win: string;
  player?: {
    id: number;
    username: string;
    avater: string;
  };
};

type RankingTodayResponse = {
  status?: boolean;
  data?: RankingTodayItem[];
  message?: string;
};

export const fetchRankingToday = async (): Promise<RankingTodayItem[]> => {
  const response = await axios.get<RankingTodayResponse>(RANKING_TODAY_API_URL);

  if (isNoRecordsResponse(response.data.status, response.data.message)) {
    return [];
  }

  if (!response.data.status) {
    throw new Error(response.data.message || "Failed to load ranking today");
  }
  return response.data.data ?? [];
};
export const fetchRankingYesterday = async (): Promise<RankingTodayItem[]> => {
  const response = await axios.get<RankingTodayResponse>(RANKING_YESTERDAY_API_URL);

  if (isNoRecordsResponse(response.data.status, response.data.message)) {
    return [];
  }

  if (!response.data.status) {
    throw new Error(response.data.message || "Failed to load ranking today");
  }
  return response.data.data ?? [];
};

export type WinTodayResponse={
  status?:boolean;
  user_id?:number;
  win?:number;
  win2:number;
  message?: string;
}
export const fetchWinToday= async (): Promise<WinTodayResponse> => {
  const response = await axios.get<WinTodayResponse>(`${WIN_TODAY_API_URL}/${getUserId()}/${GAME_ID}`);

  if (isNoRecordsResponse(response.data.status, response.data.message)) {
    return {
      status: true,
      user_id: getUserId(),
      win: 0,
      win2:0,
    };
  }

  if (!response.data.status) {
    throw new Error(response.data.message || "Failed to load win today");
  }
  return response.data;
};

type RoundData={
  id:number,
  game_id:number,
  round_no:number,
  winning_option_id:number[] ;
  status:number,
  created_at:string,
}
export type Bets={
  id?:number;
  round_id?:number;
  player_id?:number;
  game_id?:number;
  option_id?:number;
  amount?:string;
  status?:number;
  created_at?:string;
  round_data?:RoundData;
}
export type PlayerLogData={
  round_id:number;
  round_no:number;
  winning_option:number[];
  is_jackpot:number;
  winAnyOption:true;
  bets:Bets[];
}
type PlayerLogResponse={
  status?:boolean;
  message?:string;
  data?:PlayerLogData[];
}

export const fetchPlayerLog= async (): Promise<PlayerLogData[]> => {
  const response = await axios.get<PlayerLogResponse>(`${PLAYER_LOG_API_URL}/${getUserId()}`);

  if (isNoRecordsResponse(response.data.status, response.data.message)) {
    return [];
  }

  if (!response.data.status) {
    throw new Error(response.data.message || "Failed to load player log");
  }
  return response.data.data ?? [];
};

export type RechargeUrlResponse={
  status?:boolean;
  message?:string;
  url?:string;
}
export const fetchRechargeUrl = async (): Promise<RechargeUrlResponse> => {
  const response = await axios.get<RechargeUrlResponse>(RECHARGE_URL_API_URL);

  if (!response.data.status) {
    throw new Error(response.data.message || "API returned false status");
  }

  return response.data;
};





type Ranks ={
  rank_no:string;
  price:number;
  policy:string|null;
}
type Policy ={
  rank_no:string;
  price:number;
  policy:string|null;
}
export type PrizeDistributionProps = {
  status: boolean;
  ranks:Ranks[];
  policy:Policy[];
  message:string;
}

export const fetchPrizeDistribution=async (): Promise<PrizeDistributionProps> => {
  const response = await axios.get<PrizeDistributionProps>(PRIZE_DISTRIBUTIONS_API_URL);

  if (!response.data.status) {
    throw new Error(response.data.message || "API returned false status");
  }

  return response.data;
};

type getGift={
  status?:boolean;
  message?:string;
  data?:{gift_amount:number}
}

export const fetchGetGift=async (giftId:number): Promise<getGift> => {
  try {
    const response = await axios.get<getGift>(`${GET_GIFT_API_URL}/${getUserId()}/${giftId}/${GAME_ID}`);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError<getGift>(error) && error.response?.data) {
      return error.response.data;
    }

    throw error;
  }
};
type RemainingTodayData={
  server_time:string;
  end_time:string;
  remaining_seconds:number;
}
type RemainingToday={
  status: boolean;
  data:RemainingTodayData;
  message:string;
}
export const fetchRemainingToday =async()=>{
  const response = await axios.get<RemainingToday>(REMAINING_API_URL);

  if (!response.data.status) {
    throw new Error(response.data.message || "API returned false status");
  }

  return response.data;
}

type SelectedOptions={
  option_id?:number;
  option_logo?:string;
  total_amount?:number;
}
type RawHistoryData={
  round_no?:number;
  win_amount?:number;
  post_balance?:string;
  new_balance?:string;
  round_created_at?:string;
  selected_options?:SelectedOptions[];
  winning_option_id?:string | string[];
}
type HistoryData={
  round_no?:number;
  win_amount?:number;
  post_balance?:string;
  new_balance?:string;
  round_created_at?:string;
  selected_options?:SelectedOptions[];
  winning_option_id:number[];
}
export type History={
  status:boolean;
  count?:number;
  data:HistoryData[];
  message:string;
}

type RawHistory = {
  status:boolean;
  count?:number;
  data:RawHistoryData[];
  message:string;
}

function normalizeWinningOptionIds(value?: string | string[]): number[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map(Number).filter((item) => !Number.isNaN(item));
  }

  const trimmedValue = value.trim();

  try {
    const parsedValue = JSON.parse(trimmedValue);
    if (Array.isArray(parsedValue)) {
      return parsedValue.map(Number).filter((item) => !Number.isNaN(item));
    }
  } catch {
    // Fallback to comma-separated or single-value parsing.
  }

  return trimmedValue
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((item) => Number(item.trim().replace(/^"|"$/g, "")))
    .filter((item) => !Number.isNaN(item));
}

export const fetchHistoryBasic =async()=>{
  try {
    const response = await axios.get<RawHistory>(`${HISTORY_API_URL}/${getUserId()}/basic`);

    if (isNoRecordsResponse(response.data.status, response.data.message)) {
      return {
        status: true,
        count: 0,
        data: [],
        message: response.data.message,
      };
    }

    if (!response.data.status) {
      throw new Error(response.data.message || "API returned false status");
    }

    return {
      ...response.data,
      data: (response.data.data ?? []).map((item) => ({
        ...item,
        winning_option_id: normalizeWinningOptionIds(item.winning_option_id),
      })),
    };
  } catch (error) {
    return {
      status: true,
      count: 0,
      data: [],
      message: getErrorMessage(error, "Failed to load basic history"),
    };
  }
}

export const fetchHistoryAdvance =async()=>{
  try {
    const response = await axios.get<RawHistory>(`${HISTORY_API_URL}/${getUserId()}/advance`);

    if (isNoRecordsResponse(response.data.status, response.data.message)) {
      return {
        status: true,
        count: 0,
        data: [],
        message: response.data.message,
      };
    }

    if (!response.data.status) {
      throw new Error(response.data.message || "API returned false status");
    }

    return {
      ...response.data,
      data: (response.data.data ?? []).map((item) => ({
        ...item,
        winning_option_id: normalizeWinningOptionIds(item.winning_option_id),
      })),
    };
  } catch (error) {
    return {
      status: true,
      count: 0,
      data: [],
      message: getErrorMessage(error, "Failed to load advance history"),
    };
  }
}

export type MyRanking={
  status:boolean;
  data:{
    ranking_position:number;
    total_players:number;
  }
  message:string;
}
export const fetchMyRanking =async()=>{
  const response = await axios.get<MyRanking>(`${MY_RANKING_API_URL}/${getUserId()}/${GAME_ID}`);

  if (isNoRecordsResponse(response.data.status, response.data.message)) {
    return {
      status: true,
      data: {
        ranking_position: 0,
        total_players: 0,
      },
      message: response.data.message,
    };
  }

  if (!response.data.status) {
    throw new Error(response.data.message || "API returned false status");
  }

  return response.data
}
export type Jackpot={
  status: boolean;
  mode:string;
  last_7_days_total:string
  message:string;
}
export const fetchJackpot =async(Mode:string)=>{
  const response = await axios.get<Jackpot>(`${JACKPOT_FIRE_API_URL}/${Mode}`);

  if (!response.data.status) {
    throw new Error(response.data.message || "API returned false status");
  }

  return response.data;
}
