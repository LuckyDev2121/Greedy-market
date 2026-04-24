import Echo from "laravel-echo";
import Pusher from "pusher-js";
import {
  APP_ORIGIN,
  BACKEND_ORIGIN,
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

const shouldEnableRealtime =
  import.meta.env.VITE_REVERB_ENABLED === "true" ||
  (!import.meta.env.DEV && APP_ORIGIN !== BACKEND_ORIGIN);

type EchoLike = Pick<Echo<"reverb">, "channel">;

const noopEcho: EchoLike = {
  channel: () => ({
    listen: () => noopEcho.channel(""),
    stopListening: () => noopEcho.channel(""),
    subscribed: () => noopEcho.channel(""),
    error: () => noopEcho.channel(""),
  }),
};

export const echo: EchoLike = shouldEnableRealtime
  ? new Echo({
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
    })
  : noopEcho;
