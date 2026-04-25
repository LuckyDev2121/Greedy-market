type ConnectionState =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "unavailable"
  | "failed";

export const GAME_ID = 8;

function getRuntimeOrigin(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  return "https://funint.site";
}

const RUNTIME_ORIGIN = getRuntimeOrigin();
export const APP_ORIGIN = RUNTIME_ORIGIN;
export const BACKEND_ORIGIN =
  import.meta.env.VITE_BACKEND_ORIGIN || "https://funint.site";


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "/api" : `${BACKEND_ORIGIN}/api`);


export const GAME_DETAILS_API_URL = `${API_BASE_URL.replace(/\/$/, "")}/gready-market/${GAME_ID}`;
export const PLAYER_API_URL = `${API_BASE_URL.replace(/\/$/, "")}/player`;
export const GAME_RESULTS_API_URL = `${API_BASE_URL.replace(/\/$/, "")}/game/${GAME_ID}/results`;
export const ROUND_RESULT_API_URL = `${API_BASE_URL.replace(/\/$/, "")}/round-result`;
export const PLACE_BET_API_URL = `${API_BASE_URL.replace(/\/$/, "")}/place-bet`;
export const CURRENT_ROUND_API_URL = `${API_BASE_URL.replace(/\/$/, "")}/game-round/${GAME_ID}`;
export const SOUND_SETTING_API_URL = `${API_BASE_URL.replace(/\/$/, "")}/sound-setting`;
export const MUSIC_SETTING_API_URL = `${API_BASE_URL.replace(/\/$/, "")}/music-setting`;
export const RANKING_TODAY_API_URL = `${API_BASE_URL.replace(/\/$/, "")}/ranking-today/${GAME_ID}`;
export const RANKING_YESTERDAY_API_URL = `${API_BASE_URL.replace(/\/$/, "")}/ranking-yesterday/${GAME_ID}`;
export const WIN_TODAY_API_URL= `${API_BASE_URL.replace(/\/$/, "")}/win_today`;
export const PLAYER_LOG_API_URL= `${API_BASE_URL.replace(/\/$/, "")}/player-log`;
export const RECHARGE_URL_API_URL= `${API_BASE_URL.replace(/\/$/, "")}/company/wallet/1`;
export const INTRO_API_URL= `${API_BASE_URL.replace(/\/$/, "")}/intro`;
export const CURRENT_MODE_API_URL= `${API_BASE_URL.replace(/\/$/, "")}/current-mode/${GAME_ID}`;
export const CHANGE_MODE_API_URL= `${API_BASE_URL.replace(/\/$/, "")}/change-mode`;
export const PRIZE_DISTRIBUTIONS_API_URL= `${API_BASE_URL.replace(/\/$/, "")}/prize-distributions/${GAME_ID}`;
export const GET_GIFT_API_URL= `${API_BASE_URL.replace(/\/$/, "")}/get-gift`;
export const REMAINING_API_URL= `${API_BASE_URL.replace(/\/$/, "")}/remaining_today`
export const HISTORY_API_URL= `${API_BASE_URL.replace(/\/$/, "")}/gready-market-history`
export const MY_RANKING_API_URL= `${API_BASE_URL.replace(/\/$/, "")}/my-ranking`
export const JACKPOT_FIRE_API_URL= `${API_BASE_URL.replace(/\/$/, "")}/jackpot-fire`


export const REVERB_KEY =
  import.meta.env.VITE_REVERB_APP_KEY || "k6dbocgucm0at6gwak3y";
export const REALTIME_HOST =
  import.meta.env.VITE_REVERB_HOST || new URL(RUNTIME_ORIGIN).hostname;
export const REALTIME_CHANNEL =
  import.meta.env.VITE_REVERB_CHANNEL || "game-channel";
export const REALTIME_EVENT = import.meta.env.VITE_REVERB_EVENT || "game.updated";
export const REALTIME_SCHEME =
  import.meta.env.VITE_REVERB_SCHEME || new URL(RUNTIME_ORIGIN).protocol.replace(":", "");
export const USE_TLS = REALTIME_SCHEME === "https";
export const REALTIME_PORT = Number(
  import.meta.env.VITE_REVERB_PORT || (USE_TLS ? 443 : 8080),
);
export const FALLBACK_REFRESH_MS = 5_000;

export const ASSET_BASE_URL = `${BACKEND_ORIGIN}/core/storage/app/public/`;

export function getAssetUrl(path: string): string {
  if (!path) {
    return "";
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.replace(/^\/+/, "");
  const storagePrefix = "core/storage/app/public/";
  const storagePathIndex = normalizedPath.indexOf(storagePrefix);

  if (storagePathIndex >= 0) {
    return `${BACKEND_ORIGIN}/${normalizedPath.slice(storagePathIndex)}`;
  }

  return `${ASSET_BASE_URL}${normalizedPath}`;
}

export const MUSIC_BASE_URL = `${BACKEND_ORIGIN}/core/storage/app/public/sound/`;

export function getMusicUrl(path: string): string {
  if (!path) {
    return "";
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.replace(/^\/+/, "");
  const storagePrefix = "core/storage/app/public/sound/";
  const storagePathIndex = normalizedPath.indexOf(storagePrefix);

  if (storagePathIndex >= 0) {
    return `${BACKEND_ORIGIN}/${normalizedPath.slice(storagePathIndex)}`;
  }

  return `${MUSIC_BASE_URL}${normalizedPath}`;
}

export const GAME_MUSIC ={
  music: "fruit-music.mp3",
  sound: "fruit-sound.mp3",
}

export const CONNECTION_LABELS: Record<ConnectionState, string> = {
  connecting: "Connecting",
  connected: "Live",
  reconnecting: "Reconnecting",
  disconnected: "Disconnected",
  unavailable: "Unavailable",
  failed: "Failed",
};

export const GAME_ASSETS = {
  normalBg:"gready-market/game-normal-mood-bg.svg",
advanceBg:"gready-market/advance-mood-bg.svg",
middle:"gready-market/gready-middle.svg",
congraDiamond:"gready-market/gready-congra-diamond.svg",
diamond:"gready-market/gready-diamond.svg",
gameBoard:"gready-market/gready-game-board.svg",
hand:"gready-market/gready-hand.svg",
jackpotCounter:"gready-market/gready-jackpot-counter.svg",
onCard:"gready-market/gready-game-on-card.svg",
result:"gready-market/gready-result-show.svg",
jhalot:"gready-market/jhalot.svg",
leaderPart :"gready-market/leader-part-frame.svg",
RotatedInstant:"gready-market/Rotated-Instances.svg",
prize1:"gready-market/1st-position.svg",
prize2:"gready-market/2nd-possition.svg",
prize3:"gready-market/3rd-position.svg",
trofy:"gready-market/trofy.svg",
winResult:"gready-market/person-win.svg",
logo:"gready-market/loading-logo.svg",
drink:"gready-jackpot/gready-jackpot-big-drink.svg",
veg:"gready-jackpot/gready-jackpot-small-veg.svg",
rebons:"gready-market/rebons.svg"
} as const;

