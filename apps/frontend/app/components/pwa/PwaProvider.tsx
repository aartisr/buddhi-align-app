"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "../../i18n/provider";
import { PWA_SERVICE_WORKER_PATH } from "../../lib/pwa";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export const PWA_STATE_EVENT = "buddhi-align:pwa-state";
export const PWA_REQUEST_INSTALL_EVENT = "buddhi-align:request-install";

type PwaPublicState = {
  canInstall: boolean;
  isStandalone: boolean;
};

function publishPwaState(state: PwaPublicState) {
  window.dispatchEvent(new CustomEvent<PwaPublicState>(PWA_STATE_EVENT, { detail: state }));
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches
    || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

/**
 * A self-contained PWA runtime: it registers the service worker, provides a
 * respectful install affordance when the browser allows it, and lets people
 * choose when to apply an update. It deliberately does not cache API or
 * authenticated requests; see public/sw.js for the network contract.
 */
export default function PwaProvider() {
  const { t } = useI18n();
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const shouldReloadAfterUpdate = useRef(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const installPromptRef = useRef<InstallPromptEvent | null>(null);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      installPromptRef.current = event as InstallPromptEvent;
      setInstallPrompt(installPromptRef.current);
      publishPwaState({ canInstall: true, isStandalone: false });
    };

    const onRequestInstall = () => {
      const prompt = installPromptRef.current;
      if (!prompt) return;
      void prompt.prompt().then(async () => {
        await prompt.userChoice;
        installPromptRef.current = null;
        setInstallPrompt(null);
        publishPwaState({ canInstall: false, isStandalone: isStandalone() });
      });
    };

    const onAppInstalled = () => {
      installPromptRef.current = null;
      setInstallPrompt(null);
      publishPwaState({ canInstall: false, isStandalone: true });
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener(PWA_REQUEST_INSTALL_EVENT, onRequestInstall);
    window.addEventListener("appinstalled", onAppInstalled);
    publishPwaState({ canInstall: false, isStandalone: isStandalone() });

    const isPwaEnabled = process.env.NODE_ENV === "production"
      || process.env.NEXT_PUBLIC_PWA_TEST_MODE === "1";

    if (isPwaEnabled && "serviceWorker" in navigator) {
      void navigator.serviceWorker.register(PWA_SERVICE_WORKER_PATH, { scope: "/" }).then((registration) => {
        registrationRef.current = registration;
        if (registration.waiting && navigator.serviceWorker.controller) {
          setUpdateReady(true);
        }
        const monitorInstallingWorker = () => {
          const worker = registration.installing;
          if (!worker) return;

          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              setUpdateReady(true);
            }
          });
        };

        monitorInstallingWorker();
        registration.addEventListener("updatefound", monitorInstallingWorker);
      }).catch(() => {
        // Offline support is an enhancement; a registration failure must not
        // interrupt the primary application experience.
      });

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (shouldReloadAfterUpdate.current) {
          window.location.reload();
        }
      });
    }

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener(PWA_REQUEST_INSTALL_EVENT, onRequestInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    installPromptRef.current = null;
    setInstallPrompt(null);
    publishPwaState({ canInstall: false, isStandalone: isStandalone() });
  };

  const applyUpdate = () => {
    const waitingWorker = registrationRef.current?.waiting;
    if (!waitingWorker) return;
    shouldReloadAfterUpdate.current = true;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  };

  return (
    <div className="app-pwa-notices" aria-live="polite">
      {isOffline ? (
        <aside className="app-pwa-notice app-pwa-notice--offline" role="status">
          <span aria-hidden="true">◌</span>
          {t("pwa.offline")}
        </aside>
      ) : null}
      {installPrompt && !isStandalone() ? (
        <aside className="app-pwa-notice app-pwa-notice--install">
          <div>
            <strong>{t("pwa.install.title")}</strong>
            <p>{t("pwa.install.description")}</p>
          </div>
          <button type="button" className="app-pwa-notice__button" onClick={() => void install()}>
            {t("pwa.install.action")}
          </button>
        </aside>
      ) : null}
      {updateReady ? (
        <aside className="app-pwa-notice app-pwa-notice--update">
          <div>
            <strong>{t("pwa.update.title")}</strong>
            <p>{t("pwa.update.description")}</p>
          </div>
          <button type="button" className="app-pwa-notice__button" onClick={applyUpdate}>
            {t("pwa.update.action")}
          </button>
        </aside>
      ) : null}
    </div>
  );
}
