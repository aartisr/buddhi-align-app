"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { translate, DEFAULT_LOCALE } from "@/app/i18n/config";

type ToastTone = "info" | "success" | "error";

interface ToastItem {
  id: string;
  tone: ToastTone;
  title: string;
  detail?: string;
}

interface RequestMeta {
  announce: boolean;
  startTitle?: string;
  successTitle?: string;
  errorTitle?: string;
}

interface RequestDescriptor {
  method: string;
  pathname: string;
}

interface ModuleCopy {
  noun: string;
  createStart: string;
  createSuccess: string;
  updateStart: string;
  updateSuccess: string;
  deleteStart: string;
  deleteSuccess: string;
}

const MODULE_REQUEST_COPY: Record<string, ModuleCopy> = {
  karma: {
    noun: translate(DEFAULT_LOCALE, "request.module.karma.noun"),
    createStart: translate(DEFAULT_LOCALE, "request.module.karma.createStart"),
    createSuccess: translate(DEFAULT_LOCALE, "request.module.karma.createSuccess"),
    updateStart: translate(DEFAULT_LOCALE, "request.module.karma.updateStart"),
    updateSuccess: translate(DEFAULT_LOCALE, "request.module.karma.updateSuccess"),
    deleteStart: translate(DEFAULT_LOCALE, "request.module.karma.deleteStart"),
    deleteSuccess: translate(DEFAULT_LOCALE, "request.module.karma.deleteSuccess"),
  },
  bhakti: {
    noun: translate(DEFAULT_LOCALE, "request.module.bhakti.noun"),
    createStart: translate(DEFAULT_LOCALE, "request.module.bhakti.createStart"),
    createSuccess: translate(DEFAULT_LOCALE, "request.module.bhakti.createSuccess"),
    updateStart: translate(DEFAULT_LOCALE, "request.module.bhakti.updateStart"),
    updateSuccess: translate(DEFAULT_LOCALE, "request.module.bhakti.updateSuccess"),
    deleteStart: translate(DEFAULT_LOCALE, "request.module.bhakti.deleteStart"),
    deleteSuccess: translate(DEFAULT_LOCALE, "request.module.bhakti.deleteSuccess"),
  },
  jnana: {
    noun: translate(DEFAULT_LOCALE, "request.module.jnana.noun"),
    createStart: translate(DEFAULT_LOCALE, "request.module.jnana.createStart"),
    createSuccess: translate(DEFAULT_LOCALE, "request.module.jnana.createSuccess"),
    updateStart: translate(DEFAULT_LOCALE, "request.module.jnana.updateStart"),
    updateSuccess: translate(DEFAULT_LOCALE, "request.module.jnana.updateSuccess"),
    deleteStart: translate(DEFAULT_LOCALE, "request.module.jnana.deleteStart"),
    deleteSuccess: translate(DEFAULT_LOCALE, "request.module.jnana.deleteSuccess"),
  },
  dhyana: {
    noun: translate(DEFAULT_LOCALE, "request.module.dhyana.noun"),
    createStart: translate(DEFAULT_LOCALE, "request.module.dhyana.createStart"),
    createSuccess: translate(DEFAULT_LOCALE, "request.module.dhyana.createSuccess"),
    updateStart: translate(DEFAULT_LOCALE, "request.module.dhyana.updateStart"),
    updateSuccess: translate(DEFAULT_LOCALE, "request.module.dhyana.updateSuccess"),
    deleteStart: translate(DEFAULT_LOCALE, "request.module.dhyana.deleteStart"),
    deleteSuccess: translate(DEFAULT_LOCALE, "request.module.dhyana.deleteSuccess"),
  },
  vasana: {
    noun: translate(DEFAULT_LOCALE, "request.module.vasana.noun"),
    createStart: translate(DEFAULT_LOCALE, "request.module.vasana.createStart"),
    createSuccess: translate(DEFAULT_LOCALE, "request.module.vasana.createSuccess"),
    updateStart: translate(DEFAULT_LOCALE, "request.module.vasana.updateStart"),
    updateSuccess: translate(DEFAULT_LOCALE, "request.module.vasana.updateSuccess"),
    deleteStart: translate(DEFAULT_LOCALE, "request.module.vasana.deleteStart"),
    deleteSuccess: translate(DEFAULT_LOCALE, "request.module.vasana.deleteSuccess"),
  },
  dharma: {
    noun: translate(DEFAULT_LOCALE, "request.module.dharma.noun"),
    createStart: translate(DEFAULT_LOCALE, "request.module.dharma.createStart"),
    createSuccess: translate(DEFAULT_LOCALE, "request.module.dharma.createSuccess"),
    updateStart: translate(DEFAULT_LOCALE, "request.module.dharma.updateStart"),
    updateSuccess: translate(DEFAULT_LOCALE, "request.module.dharma.updateSuccess"),
    deleteStart: translate(DEFAULT_LOCALE, "request.module.dharma.deleteStart"),
    deleteSuccess: translate(DEFAULT_LOCALE, "request.module.dharma.deleteSuccess"),
  },
};

function makeToastId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeRequest(input: RequestInfo | URL, init?: RequestInit): RequestDescriptor | null {
  if (typeof window === "undefined") return null;

  const rawUrl =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : input instanceof Request
          ? input.url
          : null;

  if (!rawUrl) return null;

  const url = new URL(rawUrl, window.location.origin);
  const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();

  return {
    method,
    pathname: url.pathname,
  };
}

function shouldTrackRequest({ pathname }: RequestDescriptor): boolean {
  return pathname.startsWith("/api/") && pathname !== "/api/obs";
}

function getModuleName(pathname: string): string | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "api") return null;
  const moduleName = parts[1];
  return moduleName && moduleName in MODULE_REQUEST_COPY ? moduleName : null;
}

function describeSpecialRequest(pathname: string, method: string): RequestMeta | null {
  if (pathname === "/api/preferences" && method === "PUT") {
    return {
      announce: true,
      startTitle: translate(DEFAULT_LOCALE, "request.preferences.saving"),
      successTitle: translate(DEFAULT_LOCALE, "request.preferences.saved"),
      errorTitle: translate(DEFAULT_LOCALE, "request.preferences.failed"),
    };
  }

  if (pathname === "/api/data/export" && method === "POST") {
    return {
      announce: true,
      startTitle: translate(DEFAULT_LOCALE, "request.import.saving"),
      successTitle: translate(DEFAULT_LOCALE, "request.import.saved"),
      errorTitle: translate(DEFAULT_LOCALE, "request.import.failed"),
    };
  }

  if (pathname === "/api/data/export" && method === "GET") {
    return {
      announce: true,
      startTitle: translate(DEFAULT_LOCALE, "request.export.saving"),
      successTitle: translate(DEFAULT_LOCALE, "request.export.saved"),
      errorTitle: translate(DEFAULT_LOCALE, "request.export.failed"),
    };
  }

  return null;
}

function describeCollectionRequest(method: string, moduleCopy: ModuleCopy | null): RequestMeta {
  if (method !== "POST" || !moduleCopy) {
    return { announce: false };
  }

  return {
    announce: true,
    startTitle: moduleCopy.createStart,
    successTitle: moduleCopy.createSuccess,
    errorTitle: translate(DEFAULT_LOCALE, "request.module.error.save", {
      noun: moduleCopy.noun.toLowerCase(),
    }),
  };
}

function describeResourceRequest(method: string, moduleCopy: ModuleCopy | null): RequestMeta {
  if (!moduleCopy) {
    return { announce: false };
  }

  if (method === "PUT") {
    return {
      announce: true,
      startTitle: moduleCopy.updateStart,
      successTitle: moduleCopy.updateSuccess,
      errorTitle: translate(DEFAULT_LOCALE, "request.module.error.update", {
        noun: moduleCopy.noun.toLowerCase(),
      }),
    };
  }

  if (method === "DELETE") {
    return {
      announce: true,
      startTitle: moduleCopy.deleteStart,
      successTitle: moduleCopy.deleteSuccess,
      errorTitle: translate(DEFAULT_LOCALE, "request.module.error.remove", {
        noun: moduleCopy.noun.toLowerCase(),
      }),
    };
  }

  return { announce: false };
}

function describeRequest({ method, pathname }: RequestDescriptor): RequestMeta {
  const moduleName = getModuleName(pathname);
  const moduleCopy = moduleName ? MODULE_REQUEST_COPY[moduleName] : null;
  const special = describeSpecialRequest(pathname, method);

  if (special) {
    return special;
  }

  if (/^\/api\/[a-z-]+$/.test(pathname)) {
    return describeCollectionRequest(method, moduleCopy);
  }

  if (/^\/api\/[a-z-]+\/.+/.test(pathname)) {
    return describeResourceRequest(method, moduleCopy);
  }

  if (method === "GET" || method === "HEAD") {
    return { announce: false };
  }

  return {
    announce: true,
    startTitle: translate(DEFAULT_LOCALE, "request.generic.sending"),
    successTitle: translate(DEFAULT_LOCALE, "request.generic.completed"),
    errorTitle: translate(DEFAULT_LOCALE, "request.generic.failed"),
  };
}

async function getErrorDetail(response: Response): Promise<string | undefined> {
  try {
    const payload = (await response.clone().json()) as { error?: string; message?: string };
    return payload.error ?? payload.message;
  } catch {
    return response.statusText || undefined;
  }
}

function PrayerSpinner({ label }: { label: string }) {
  return (
    <div className="app-request-spinner" aria-label={label} role="status">
      <div className="app-request-spinner__halo" />
      <div className="app-request-spinner__ring app-request-spinner__ring--outer" />
      <div className="app-request-spinner__ring app-request-spinner__ring--inner" />
      <div className="app-request-spinner__center">ॐ</div>
    </div>
  );
}

function ToastStack({
  toasts,
  dismissToast,
}: {
  toasts: ToastItem[];
  dismissToast: (id: string) => void;
}) {
  return (
    <div className="app-request-toast-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        toast.tone === "error" ? (
          <div key={toast.id} className={`app-request-toast app-request-toast--${toast.tone}`} role="alert">
            <div className="app-request-toast__row">
              <span className="app-request-toast__badge" aria-hidden="true">!</span>
              <div className="app-request-toast__copy">
                <strong>{toast.title}</strong>
                {toast.detail ? <span>{toast.detail}</span> : null}
              </div>
              <button
                type="button"
                className="app-request-toast__dismiss"
                aria-label={translate(DEFAULT_LOCALE, "request.dismiss")}
                onClick={() => dismissToast(toast.id)}
              >
                ×
              </button>
            </div>
          </div>
        ) : (
          <div key={toast.id} className={`app-request-toast app-request-toast--${toast.tone}`} role="status">
            <div className="app-request-toast__row">
              <span className="app-request-toast__badge" aria-hidden="true">
                {toast.tone === "info" ? "⋯" : "✓"}
              </span>
              <div className="app-request-toast__copy">
                <strong>{toast.title}</strong>
                {toast.detail ? <span>{toast.detail}</span> : null}
              </div>
              <button
                type="button"
                className="app-request-toast__dismiss"
                aria-label={translate(DEFAULT_LOCALE, "request.dismiss")}
                onClick={() => dismissToast(toast.id)}
              >
                ×
              </button>
            </div>
          </div>
        )
      ))}
    </div>
  );
}

function queueStartToast(
  toastId: string | null,
  requestMeta: RequestMeta,
  descriptor: RequestDescriptor,
  queueToast: (toast: ToastItem) => void,
) {
  if (!toastId || !requestMeta.startTitle) {
    return;
  }

  queueToast({
    id: toastId,
    tone: "info",
    title: requestMeta.startTitle,
    detail: descriptor.method === "GET"
      ? translate(DEFAULT_LOCALE, "request.detail.read")
      : translate(DEFAULT_LOCALE, "request.detail.write"),
  });
}

function queueFailureToast(
  toastId: string | null,
  requestMeta: RequestMeta,
  detail: string | undefined,
  queueToast: (toast: ToastItem) => void,
) {
  if (!toastId || !requestMeta.errorTitle) {
    return;
  }

  queueToast({
    id: toastId,
    tone: "error",
    title: requestMeta.errorTitle,
    detail,
  });
}

function queueSuccessToast(
  toastId: string | null,
  requestMeta: RequestMeta,
  queueToast: (toast: ToastItem) => void,
) {
  if (!toastId || !requestMeta.successTitle) {
    return;
  }

  queueToast({
    id: toastId,
    tone: "success",
    title: requestMeta.successTitle,
  });
}

async function executeTrackedRequest({
  originalFetch,
  input,
  init,
  toastId,
  requestMeta,
  queueToast,
}: {
  originalFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  input: RequestInfo | URL;
  init?: RequestInit;
  toastId: string | null;
  requestMeta: RequestMeta;
  queueToast: (toast: ToastItem) => void;
}): Promise<Response> {
  try {
    const response = await originalFetch(input, init);
    if (response.ok) {
      queueSuccessToast(toastId, requestMeta, queueToast);
      return response;
    }

    const detail = await getErrorDetail(response);
    queueFailureToast(
      toastId,
      requestMeta,
      detail ?? translate(DEFAULT_LOCALE, "request.error.serverStatus", { status: response.status }),
      queueToast,
    );
    return response;
  } catch (error) {
    const detail = error instanceof Error ? error.message : translate(DEFAULT_LOCALE, "request.error.tryAgain");
    queueFailureToast(toastId, requestMeta, detail, queueToast);
    throw error;
  }
}

export default function RequestFeedbackProvider({ children }: { children: React.ReactNode }) {
  const [pendingCount, setPendingCount] = useState(0);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const hideOverlayTimerRef = useRef<number | null>(null);
  const toastTimersRef = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const timerId = toastTimersRef.current.get(id);
    if (timerId) {
      window.clearTimeout(timerId);
      toastTimersRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const queueToast = useCallback((toast: ToastItem) => {
    setToasts((current) => {
      const next = current.filter((item) => item.id !== toast.id);
      return [...next, toast].slice(-4);
    });

    const currentTimer = toastTimersRef.current.get(toast.id);
    if (currentTimer) {
      window.clearTimeout(currentTimer);
    }

    const lifetime = toast.tone === "error" ? 5200 : toast.tone === "success" ? 3200 : 1800;
    const timerId = window.setTimeout(() => dismissToast(toast.id), lifetime);
    toastTimersRef.current.set(toast.id, timerId);
  }, [dismissToast]);

  useEffect(() => {
    if (pendingCount > 0) {
      if (hideOverlayTimerRef.current) {
        window.clearTimeout(hideOverlayTimerRef.current);
        hideOverlayTimerRef.current = null;
      }

      const showTimer = window.setTimeout(() => setOverlayVisible(true), 160);
      return () => window.clearTimeout(showTimer);
    }

    if (!overlayVisible) return;

    hideOverlayTimerRef.current = window.setTimeout(() => {
      setOverlayVisible(false);
      hideOverlayTimerRef.current = null;
    }, 180);

    return () => {
      if (hideOverlayTimerRef.current) {
        window.clearTimeout(hideOverlayTimerRef.current);
        hideOverlayTimerRef.current = null;
      }
    };
  }, [overlayVisible, pendingCount]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalFetch = window.fetch.bind(window);
    const toastTimers = toastTimersRef.current;

    async function trackedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const descriptor = normalizeRequest(input, init);
      if (!descriptor || !shouldTrackRequest(descriptor)) {
        return originalFetch(input, init);
      }

      const requestMeta = describeRequest(descriptor);
      const toastId = requestMeta.announce ? makeToastId() : null;
      const shouldAffectOverlay = requestMeta.announce;

      if (shouldAffectOverlay) {
        setPendingCount((count) => count + 1);
      }

      queueStartToast(toastId, requestMeta, descriptor, queueToast);

      try {
        return await executeTrackedRequest({
          originalFetch,
          input,
          init,
          toastId,
          requestMeta,
          queueToast,
        });
      } finally {
        if (shouldAffectOverlay) {
          setPendingCount((count) => Math.max(0, count - 1));
        }
      }
    }

    window.fetch = trackedFetch;

    return () => {
      window.fetch = originalFetch;
      toastTimers.forEach((timerId) => window.clearTimeout(timerId));
      toastTimers.clear();
    };
  }, [queueToast]);

  return (
    <>
      {children}
      <ToastStack toasts={toasts} dismissToast={dismissToast} />
      <div
        className={`app-request-overlay ${overlayVisible ? "app-request-overlay--visible" : ""}`}
      >
        <div className="app-request-overlay__panel">
          <PrayerSpinner label={translate(DEFAULT_LOCALE, "request.overlay.waiting")} />
          <p className="app-request-overlay__title">{translate(DEFAULT_LOCALE, "request.overlay.title")}</p>
          <p className="app-request-overlay__subtitle">{translate(DEFAULT_LOCALE, "request.overlay.subtitle")}</p>
        </div>
      </div>
    </>
  );
}