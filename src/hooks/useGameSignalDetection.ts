import { useEffect } from 'react';

type Message = Record<string, unknown>;

export const useGameSignalDetection = (
  messages: Array<unknown> | undefined,
  onRequestOpen?: () => void,
  onGameSignalReceived?: () => void,
) => {
  useEffect(() => {
    if (!Array.isArray(messages) || messages.length === 0) return;

    const latestWithMetadata = [...(messages as Array<Message>)]
      .reverse()
      .find((m) => {
        const role = m?.role as string | undefined;
        const isAssistant = role === 'assistant' || role === 'ASSISTANT';
        const metadata = m?.metadata as Record<string, unknown> | undefined;
        const parts = m?.parts as
          | Array<{ type?: string; text?: string }>
          | undefined;

        const hasGameGeneratorMeta =
          !!metadata &&
          typeof metadata === 'object' &&
          ((metadata as Record<string, unknown>)['game_generator'] !==
            undefined ||
            (metadata as Record<string, unknown>)['game-signal'] !== undefined);

        const hasGameGeneratorPart = Array.isArray(parts)
          ? parts.some(
              (p) => p?.type === 'game_generator' || p?.type === 'game-signal',
            )
          : false;

        return isAssistant && (hasGameGeneratorMeta || hasGameGeneratorPart);
      });

    if (latestWithMetadata) {
      onRequestOpen?.();
      onGameSignalReceived?.();
    }
  }, [messages, onRequestOpen, onGameSignalReceived]);
};
