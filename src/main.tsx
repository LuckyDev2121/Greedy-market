import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { checkIntroIntegration } from "./api/auth.ts"
import { closeCurrentView } from "./utils/closeCurrentView.ts"

async function bootstrap() {
  const search = window.location.search.replace(/\?/g, "&").replace(/^&/, "?");
  const params = new URLSearchParams(search);

  const userId = Number(params.get("userid"));
  const token = Number(params.get("token"));
  try {
    const res = await checkIntroIntegration(userId, token);
    if (!res.status || !res.user_id) {
      closeCurrentView();
      return;
    }

    // ✅ SAVE USER ID GLOBALLY
    localStorage.setItem("user_id", res.user_id.toString());

    createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (err) {
    console.error("Intro check failed", err);
    closeCurrentView();
  }
}
bootstrap();
