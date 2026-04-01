"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
    noun: "Karma Yoga entry",
    createStart: "Saving your Karma Yoga entry",
    createSuccess: "Karma Yoga entry saved",
    updateStart: "Updating your Karma Yoga entry",
    updateSuccess: "Karma Yoga entry updated",
    deleteStart: "Removing your Karma Yoga entry",
    deleteSuccess: "Karma Yoga entry removed",
  },
  bhakti: {
    noun: "Bhakti reflection",
    createStart: "Saving your Bhakti reflection",
    createSuccess: "Bhakti reflection saved",
    updateStart: "Updating your Bhakti reflection",
    updateSuccess: "Bhakti reflection updated",
    deleteStart: "Removing your Bhakti reflection",
    deleteSuccess: "Bhakti reflection removed",
  },
  jnana: {
    noun: "Jnana reflection",
    createStart: "Saving your Jnana reflection",
    createSuccess: "Jnana reflection saved",
    updateStart: "Updating your Jnana reflection",
    updateSuccess: "Jnana reflection updated",
    deleteStart: "Removing your Jnana reflection",
    deleteSuccess: "Jnana reflection removed",
  },
  dhyana: {
    noun: "Dhyana session",
    createStart: "Saving your Dhyana session",
    createSuccess: "Dhyana session saved",
    updateStart: "Updating your Dhyana session",
    updateSuccess: "Dhyana session updated",
    deleteStart: "Removing your Dhyana session",
    deleteSuccess: "Dhyana session removed",
  },
  vasana: {
    noun: "Vasana note",
    createStart: "Saving your Vasana note",
    createSuccess: "Vasana note saved",
    updateStart: "Updating your Vasana note",
    updateSuccess: "Vasana note updated",
    deleteStart: "Removing your Vasana note",
    deleteSuccess: "Vasana note removed",
  },
  dharma: {
    noun: "Dharma plan",
    createStart: "Saving your Dharma plan",
    createSuccess: "Dharma plan saved",
    updateStart: "Updating your Dharma plan",
    updateSuccess: "Dharma plan updated",
    deleteStart: "Removing your Dharma plan",
    deleteSuccess: "Dharma plan removed",
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

function describeRequest({ method, pathname }: RequestDescriptor): RequestMeta {
  const moduleName = getModuleName(pathname);
  const moduleCopy = moduleName ? MODULE_REQUEST_COPY[moduleName] : null;

  if (pathname === "/api/preferences" && method === "PUT") {
    return {
      announce: true,
      startTitle: "Saving your preferences",
      successTitle: "Preferences updated",
      errorTitle: "Could not save preferences",
    };
  }

  if (pathname === "/api/data/export" && method === "POST") {
    return {
      announce: true,
      startTitle: "Importing your archive",
      successTitle: "Archive imported",
      errorTitle: "Import failed",
    };
  }

  if (pathname === "/api/data/export" && method === "GET") {
    return {
      announce: true,
      startTitle: "Preparing your export",
      successTitle: "Export is ready",
      errorTitle: "Export failed",
    };
  }

  if (/^\/api\/[a-z-]+$/.test(pathname)) {
    if (method === "POST" && moduleCopy) {
      return {
        announce: true,
        startTitle: moduleCopy.createStart,
        successTitle: moduleCopy.createSuccess,
        errorTitle: `Could not save your ${moduleCopy.noun.toLowerCase()}`,
      };
    }

    return { announce: false };
  }

  if (/^\/api\/[a-z-]+\/.+/.test(pathname)) {
    if (method === "PUT" && moduleCopy) {
      return {
        announce: true,
        startTitle: moduleCopy.updateStart,
        successTitle: moduleCopy.updateSuccess,
        errorTitle: `Could not update your ${moduleCopy.noun.toLowerCase()}`,
      };
    }

    if (method === "DELETE" && moduleCopy) {
      return {
        announce: true,
        startTitle: moduleCopy.deleteStart,
        successTitle: moduleCopy.deleteSuccess,
        errorTitle: `Could not remove your ${moduleCopy.noun.toLowerCase()}`,
      };
    }

    return { announce: false };
  }

  if (method !== "GET" && method !== "HEAD") {
    return {
      announce: true,
      startTitle: "Sending request",
      successTitle: "Request completed",
      errorTitle: "Request failed",
    };
  }

  return { announce: false };
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

      setPendingCount((count) => count + 1);

      if (toastId && requestMeta.startTitle) {
        queueToast({
          id: toastId,
          tone: "info",
          title: requestMeta.startTitle,
          detail: descriptor.method === "GET" ? "Talking to the server..." : "One moment while we sync your changes.",
        });
      }

      try {
        const response = await originalFetch(input, init);

        if (!response.ok) {
          const detail = await getErrorDetail(response);

          if (toastId && requestMeta.errorTitle) {
            queueToast({
              id: toastId,
              tone: "error",
              title: requestMeta.errorTitle,
              detail: detail ?? `Server responded with ${response.status}.`,
            });
          }

          return response;
        }

        if (toastId && requestMeta.successTitle) {
          queueToast({
            id: toastId,
            tone: "success",
            title: requestMeta.successTitle,
          });
        }

        return response;
      } catch (error) {
        if (toastId && requestMeta.errorTitle) {
          queueToast({
            id: toastId,
            tone: "error",
            title: requestMeta.errorTitle,
            detail: error instanceof Error ? error.message : "Please try again.",
          });
        }

        throw error;
      } finally {
        setPendingCount((count) => Math.max(0, count - 1));
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
      <div className="app-request-toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          toast.tone === "error" ? (
            <div
              key={toast.id}
              className={`app-request-toast app-request-toast--${toast.tone}`}
              role="alert"
            >
              <div className="app-request-toast__row">
                <span className="app-request-toast__badge" aria-hidden="true">
                  !
                </span>
                <div className="app-request-toast__copy">
                  <strong>{toast.title}</strong>
                  {toast.detail ? <span>{toast.detail}</span> : null}
                </div>
                <button
                  type="button"
                  className="app-request-toast__dismiss"
                  aria-label="Dismiss notification"
                  onClick={() => dismissToast(toast.id)}
                >
                  ×
                </button>
              </div>
            </div>
          ) : (
            <div
              key={toast.id}
              className={`app-request-toast app-request-toast--${toast.tone}`}
              role="status"
            >
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
                  aria-label="Dismiss notification"
                  onClick={() => dismissToast(toast.id)}
                >
                  ×
                </button>
              </div>
            </div>
          )
        ))}
      </div>
      <div
        className={`app-request-overlay ${overlayVisible ? "app-request-overlay--visible" : ""}`}
      >
        <div className="app-request-overlay__panel">
          <PrayerSpinner label="Waiting for the server" />
          <p className="app-request-overlay__title">Connecting with the server</p>
          <p className="app-request-overlay__subtitle">Your latest changes are on their way.</p>
        </div>
      </div>
    </>
  );
}