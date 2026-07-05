import { useCallback, useEffect, useMemo, useRef, type FormEvent, type KeyboardEvent } from "react";
import { AlertTriangle, Bot, Send, Sparkles } from "lucide-react";
import { mockNearbyHospitals } from "@/data/mockHospitals";
import { useParentContext } from "@/contexts";
import { useAIChat } from "@/hooks/useAIChat";
import { useVisualViewportInset } from "@/hooks/useVisualViewportInset";
import { cn } from "@/lib/cn";

export const PROMPT_CHIPS = [
  "What vaccines are due at 6 weeks?",
  "How do I manage a mild fever after a vaccination?",
  "Find my nearest preferred health center.",
] as const;

const WELCOME_TEXT =
  "Hello! Ask me anything about your child's vaccination roadmap, upcoming timelines, or managing common mild symptoms.";

const INFO_BANNER_TEXT =
  "This chatbot provides general vaccination information only and does not replace professional medical diagnosis or emergency care.";

function renderMessageContent(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return part.split("\n").map((line, lineIndex, lines) => (
      <span key={`${index}-${lineIndex}`}>
        {line}
        {lineIndex < lines.length - 1 && <br />}
      </span>
    ));
  });
}

function TypingIndicator() {
  return (
    <div className="flex justify-start" aria-live="polite" aria-label="Assistant is typing">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-none border border-slate-800/60 bg-slate-900 px-4 py-3">
        <span className="h-2 w-2 animate-pulse rounded-full bg-slate-500 [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-slate-500 [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-slate-500 [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function SafetyBanner() {
  return (
    <div
      role="note"
      className="z-20 flex shrink-0 items-center justify-center gap-2 border-b border-amber-900/50 bg-amber-950/40 px-4 py-2 text-center text-xs text-amber-200/90 backdrop-blur-sm"
    >
      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-300/90" aria-hidden="true" />
      <p>{INFO_BANNER_TEXT}</p>
    </div>
  );
}

function WelcomeEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
      <div className="relative mb-6 flex h-28 w-28 items-center justify-center">
        <div
          className="absolute inset-2 rounded-full bg-emerald-500/15 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="relative flex h-[4.75rem] w-[4.75rem] items-center justify-center rounded-2xl border border-emerald-500/30 bg-slate-900/50 shadow-[0_0_40px_rgba(16,185,129,0.14)] ring-1 ring-emerald-400/25"
          aria-hidden="true"
        >
          <Bot className="h-10 w-10 text-emerald-400/75" strokeWidth={1.25} />
        </div>
      </div>
      <p className="max-w-md text-sm leading-relaxed text-slate-400 sm:text-[0.9375rem]">
        {WELCOME_TEXT}
      </p>
    </div>
  );
}

export function AssistantChat() {
  const { children } = useParentContext();
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const keyboardInset = useVisualViewportInset();

  const preferredHospitalId =
    children.find((child) => child.preferredHospitalId)?.preferredHospitalId ?? null;

  const preferredHospitalName = useMemo(() => {
    if (!preferredHospitalId) return null;
    return mockNearbyHospitals.find((hospital) => hospital.id === preferredHospitalId)?.name ?? null;
  }, [preferredHospitalId]);

  const { messages, input, setInput, isTyping, sendMessage } = useAIChat({
    childNames: children.map((child) => child.name),
    preferredHospitalName,
  });

  const isEmpty = messages.length === 0;

  const scrollToLatest = useCallback(() => {
    const container = threadRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, []);

  useEffect(() => {
    if (isEmpty && !isTyping) return;
    scrollToLatest();
  }, [isEmpty, isTyping, messages, scrollToLatest]);

  useEffect(() => {
    if (keyboardInset > 0) {
      scrollToLatest();
    }
  }, [keyboardInset, scrollToLatest]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  };

  const handleChipClick = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    window.setTimeout(() => {
      inputRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 300);
  };

  const footerPaddingBottom =
    keyboardInset > 0
      ? `calc(${keyboardInset}px + env(safe-area-inset-bottom, 0px) + 0.75rem)`
      : undefined;

  return (
    <div className="assistant-chat flex h-full min-h-0 flex-col bg-slate-950">
      <SafetyBanner />

      <header className="z-10 shrink-0 border-b border-slate-800/60 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/15 ring-1 ring-emerald-500/30">
            <Bot className="h-5 w-5 text-emerald-400" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-100">Vaccination Assistant</h2>
              <Sparkles className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            </div>
            <p className="text-sm text-slate-400">
              Personalized guidance for schedules, care tips, and health centers
            </p>
          </div>
        </div>
      </header>

      <div
        ref={threadRef}
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 sm:px-6",
          isEmpty && !isTyping ? "py-0" : "space-y-4 py-5",
        )}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {isEmpty && !isTyping ? (
          <WelcomeEmptyState />
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed sm:max-w-[75%]",
                    message.role === "user"
                      ? "rounded-2xl rounded-br-none bg-emerald-600 text-white"
                      : "rounded-2xl rounded-bl-none border border-slate-800/60 bg-slate-900 text-slate-100",
                  )}
                >
                  {renderMessageContent(message.text)}
                </div>
              </div>
            ))}

            {isTyping && <TypingIndicator />}
          </>
        )}
      </div>

      <footer
        className="z-10 shrink-0 border-t border-slate-800/60 bg-slate-950/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pt-3 backdrop-blur-md sm:px-6 md:pb-6"
        style={footerPaddingBottom ? { paddingBottom: footerPaddingBottom } : undefined}
      >
        <div
          className="mb-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label="Suggested prompts"
        >
          {PROMPT_CHIPS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleChipClick(prompt)}
              className="shrink-0 rounded-full border border-slate-800/60 bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-emerald-500/40 hover:bg-slate-800 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <label htmlFor="assistant-input" className="sr-only">
            Message the vaccination assistant
          </label>
          <textarea
            ref={inputRef}
            id="assistant-input"
            rows={1}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            placeholder="Ask about vaccines, side effects, or health centers..."
            disabled={isTyping}
            enterKeyHint="send"
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-slate-800/60 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:pointer-events-none disabled:opacity-50"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </footer>
    </div>
  );
}
