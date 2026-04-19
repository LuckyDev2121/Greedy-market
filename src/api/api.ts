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
} from "../config/gameConfig";
import { getUserId } from "../utils/user";

type GameOption = {
  id: number;
  name: string;
  logo: string;
};

type BetAmount = {
  id: number;
  amount: string;
  icon: string;
};

type HowToPlay = {
  rules?: string;
};

export type GameDetailsData = {
  id?: number;
  name?: string;
  how_to_play?: HowToPlay;
  options?: GameOption[];
  bet_amounts?: BetAmount[];
  [key: string]: unknown;
};

type GameDetails = {
  status?: boolean;
  data?: GameDetailsData;
  message?: string;
};

export const fetchGameDetail = async (): Promise<GameDetailsData> => {
  const response = await axios.get<GameDetails>(GAME_DETAILS_API_URL);

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

  if (!response.data.status) {
    throw new Error(response.data.message || "API returned false status");
  }

  return response.data;
};

export type PlaceBet = {
  status?: boolean;
  message?: string;
};

export const placeBet = async (betId: number, amount: number): Promise<PlaceBet> => {
  const response = await axios.post<PlaceBet>(PLACE_BET_API_URL, {
    game_id: GAME_ID,
    option_id: betId,
    amount: amount,
    user_id: getUserId(),
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
  winning_option_id: number[]; // ✅ ALWAYS ARRAY NOW
  winners: Winners[];
  jackpot_avatar?: string;
};

export type MakeResultResponse = {
  status: boolean;
  message: string;
  jackpot_avatar?:string;
  data?: ResultData;
  remaining_seconds?: number;
  
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


export const createRound = async (): Promise<CreateRoundResponse> => {
    const response = await axios.get<CreateRoundResponse>(CURRENT_ROUND_API_URL);
  
  if (!response.data) {
    throw new Error(response.data || "Failed to load sound setting");
  }

  return response.data;
}

type SoundSettingResponse = {
  status?: boolean;
  data?: number;
  message?: string;
};

export const fetchSoundSetting = async (): Promise<boolean> => {
  const response = await axios.get<SoundSettingResponse>(`${SOUND_SETTING_API_URL}/${GAME_ID}/${getUserId()}`);
console.log("userid", getUserId(),"fetchMusic",response.data);
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
  console.log("saveSound-userid",getUserId(),"isSoundOn",isSoundOn)
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
console.log("userid", getUserId(),"fetchMusic",response.data);
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
console.log("saveMusic-userid",getUserId(),"isMusicOn",isMusicOn)
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

  if (!response.data.status) {
    throw new Error(response.data.message || "Failed to load ranking today");
  }
  return response.data.data ?? [];
};

export type WinTodayResponse={
  status?:boolean;
  user_id?:number;
  win?:number;
}
export const fetchWinToday= async (): Promise<WinTodayResponse> => {
  const response = await axios.get<WinTodayResponse>(`${WIN_TODAY_API_URL}/${getUserId()}`);

  if (!response.data.status) {
    throw new Error(response.data.status || "Failed to load ranking today");
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

  if (!response.data.status) {
    throw new Error(response.data.status || "Failed to load ranking today");
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