type NativeWindow = Window & {
  Android?: {
    exitApp?: () => void;
  };
  webkit?: {
    messageHandlers?: {
      exitApp?: {
        postMessage: (message: null) => void;
      };
    };
  };
};

const FALLBACK_CLOSE_URL = "about:blank";

export function closeCurrentView(): void {
  const nativeWindow = window as NativeWindow;

  if (nativeWindow.Android?.exitApp) {
    nativeWindow.Android.exitApp();
    return;
  }

  if (nativeWindow.webkit?.messageHandlers?.exitApp) {
    nativeWindow.webkit.messageHandlers.exitApp.postMessage(null);
    return;
  }

  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  window.close();

  window.setTimeout(() => {
    if (!window.closed) {
      window.location.replace(FALLBACK_CLOSE_URL);
    }
  }, 150);
}
