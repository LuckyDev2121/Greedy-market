import Echo from "laravel-echo";
import Pusher from "pusher-js";
import {
  REALTIME_HOST,
  REALTIME_PORT,
  REVERB_KEY,
  USE_TLS,
} from "../config/gameConfig";

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

window.Pusher = Pusher;

export const echo = new Echo({
  broadcaster: "reverb",
      key: REVERB_KEY,
      wsHost: REALTIME_HOST,
      httpHost: REALTIME_HOST,
      wsPort: REALTIME_PORT,
      httpPort: REALTIME_PORT,
      wssPort: REALTIME_PORT,
      httpsPort: REALTIME_PORT,
      forceTLS: USE_TLS,
      enabledTransports: USE_TLS ? ["wss"] : ["ws"],
      disableStats: true,
      cluster: "",
      namespace: false,
});