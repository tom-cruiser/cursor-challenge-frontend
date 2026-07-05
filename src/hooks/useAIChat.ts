import { useCallback, useState } from "react";
import { resolveMockAssistantReply, type AIChatContext } from "@/lib/aiChatEngine";

export type AIMessageRole = "user" | "assistant";

export interface AIMessage {
  id: string;
  role: AIMessageRole;
  text: string;
  timestamp: Date;
}

export interface UseAIChatOptions extends AIChatContext {}

const RESPONSE_DELAY_MS = 1500;

function createId(): string {
  return crypto.randomUUID();
}

function createMessage(
  role: AIMessageRole,
  text: string,
): AIMessage {
  return {
    id: createId(),
    role,
    text,
    timestamp: new Date(),
  };
}

export function useAIChat({
  childNames,
  preferredHospitalName,
}: UseAIChatOptions) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return false;

      setMessages((prev) => [...prev, createMessage("user", trimmed)]);
      setInput("");
      setIsTyping(true);

      const reply = resolveMockAssistantReply(trimmed, {
        childNames,
        preferredHospitalName,
      });

      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, RESPONSE_DELAY_MS);
      });

      setMessages((prev) => [...prev, createMessage("assistant", reply)]);
      setIsTyping(false);
      return true;
    },
    [childNames, isTyping, preferredHospitalName],
  );

  return {
    messages,
    input,
    setInput,
    isTyping,
    sendMessage,
  };
}
