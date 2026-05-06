"use client";

import React, { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { MODULE_CATALOG } from "@/app/i18n/config";
import { useI18n } from "@/app/i18n/provider";
import { logEvent } from "@/app/lib/logEvent";
import type { CopilotChatResponse } from "@/app/lib/copilot/types";

import CopilotMessage, { type CopilotUiMessage } from "./CopilotMessage";

const isCopilotEnabled = process.env.NEXT_PUBLIC_COPILOT_ENABLED !== "0";

const QUICK_PROMPTS = [
  "What should I do first?",
  "Open the community",
  "How do I request an autograph?",
] as const;

function makeMessageId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getCurrentModuleKey(pathname: string | null): string | undefined {
  if (!pathname) return undefined;
  const moduleItem = MODULE_CATALOG.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  return moduleItem?.key;
}

function welcomeMessage(): CopilotUiMessage {
  return {
    id: "copilot-welcome",
    role: "assistant",
    content: "Ask about any Buddhi Align page, community space, or Autograph Exchange path.",
    actions: [
      { type: "navigate", label: "Start With Dharma", href: "/dharma-planner", moduleKey: "dharma" },
      { type: "open_community", label: "Open Community", href: "/community" },
    ],
  };
}

export default function BuddhiAlignCopilot() {
  const pathname = usePathname();
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<CopilotUiMessage[]>(() => [welcomeMessage()]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const moduleKey = useMemo(() => getCurrentModuleKey(pathname), [pathname]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    logEvent("copilot_opened", { path: pathname, moduleKey });
  }, [moduleKey, open, pathname]);

  useEffect(() => {
    if (!open) return;
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, status]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!isCopilotEnabled) return null;

  const submitMessage = async (messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed || status === "loading") return;

    const userMessage: CopilotUiMessage = {
      id: makeMessageId("user"),
      role: "user",
      content: trimmed,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setStatus("loading");
    logEvent("copilot_message_submitted", { path: pathname, moduleKey });

    try {
      const response = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
          context: {
            path: pathname ?? "/",
            locale,
            moduleKey,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Copilot request failed with ${response.status}`);
      }

      const payload = (await response.json()) as CopilotChatResponse;
      setMessages((current) => [
        ...current,
        {
          id: makeMessageId("assistant"),
          role: "assistant",
          content: payload.answer,
          citations: payload.citations,
          actions: payload.actions,
          confidence: payload.confidence,
        },
      ]);
      setStatus("idle");
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: makeMessageId("assistant-error"),
          role: "assistant",
          content: "Copilot is temporarily unavailable. The support page is still available if something needs attention.",
          actions: [{ type: "open_support", label: "Open Support", href: "/support" }],
          confidence: "low",
        },
      ]);
      setStatus("error");
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitMessage(input);
  };

  return (
    <div className={`app-copilot${open ? " app-copilot--open" : ""}`}>
      {open ? (
        <section className="app-copilot-panel" role="dialog" aria-label="Buddhi Align Copilot" aria-modal="false">
          <header className="app-copilot-header">
            <div>
              <p className="app-copilot-kicker">Copilot</p>
              <h2>Buddhi Align</h2>
            </div>
            <button type="button" className="app-copilot-icon-button" aria-label="Close Copilot" onClick={() => setOpen(false)}>
              x
            </button>
          </header>

          <div className="app-copilot-messages" ref={messagesRef} aria-live="polite">
            {messages.map((message) => (
              <CopilotMessage key={message.id} message={message} onNavigate={() => setOpen(false)} />
            ))}
            {status === "loading" ? (
              <div className="app-copilot-message app-copilot-message--assistant app-copilot-message--loading">
                <span className="app-inline-spinner" aria-hidden="true" />
                <span>Searching Buddhi Align...</span>
              </div>
            ) : null}
          </div>

          <div className="app-copilot-prompts" aria-label="Quick prompts">
            {QUICK_PROMPTS.map((prompt) => (
              <button key={prompt} type="button" onClick={() => void submitMessage(prompt)} disabled={status === "loading"}>
                {prompt}
              </button>
            ))}
          </div>

          <form className="app-copilot-form" onSubmit={handleSubmit}>
            <label htmlFor="buddhi-copilot-input" className="sr-only">Ask Buddhi Align Copilot</label>
            <input
              id="buddhi-copilot-input"
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask Buddhi Align"
              maxLength={1200}
              disabled={status === "loading"}
            />
            <button type="submit" disabled={!input.trim() || status === "loading"} aria-label="Send message">
              Send
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        className="app-copilot-launcher"
        aria-label="Open Buddhi Align Copilot"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden>?</span>
        <span>Copilot</span>
      </button>
    </div>
  );
}
