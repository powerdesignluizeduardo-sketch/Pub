// n8n webhook service
// Sends user messages to n8n and receives { output, audio } back.
// "output" is the tutor's text reply; "audio" is a Base64-encoded MP3 from ElevenLabs.

const WEBHOOK_URL = "https://webhook.naveedu.io/webhook/maplebear-tutor";

// How long to wait for a response (ms)
const TIMEOUT_MS = 30_000;

// How many times to retry on transient server errors (5xx / network failure)
const MAX_RETRIES = 2;

export interface N8nResponse {
  text: string;
  audioUrl?: string; // data:audio/mpeg;base64,<...> ready for <audio src>
}

interface SendToN8nParams {
  message: string;
  tutorKey: string;
  styleId: string;
  conversationHistory: { role: string; text: string }[];
  studentName?: string;
  studentInfo?: Record<string, string>;
}

/** Returns true when a webhook URL is configured (always true here, but kept for parity). */
export function isWebhookConfigured(): boolean {
  return Boolean(WEBHOOK_URL);
}

/**
 * POST the user message to the n8n webhook.
 * Retries up to MAX_RETRIES times on 5xx or network errors.
 * Safely handles empty / non-JSON bodies so we never throw SyntaxError.
 */
export async function sendToN8n(params: SendToN8nParams): Promise<N8nResponse> {
  const body = JSON.stringify({
    message: params.message,
    tutorKey: params.tutorKey,
    styleId: params.styleId,
    conversationHistory: params.conversationHistory,
    studentName: params.studentName ?? "",
    studentInfo: params.studentInfo ?? {},
  });

  let lastError: Error = new Error("Unknown error");

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      let response: Response;
      try {
        response = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      // Retry on server-side errors
      if (response.status >= 500) {
        lastError = new Error(`n8n returned HTTP ${response.status}`);
        if (attempt < MAX_RETRIES) {
          await sleep(800 * (attempt + 1));
          continue;
        }
        throw lastError;
      }

      if (!response.ok) {
        throw new Error(`n8n returned HTTP ${response.status}`);
      }

      // --- Safe JSON parsing ---
      const raw = await response.text();

      if (!raw || raw.trim() === "") {
        throw new Error("n8n returned an empty body");
      }

      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(`n8n returned non-JSON body: ${raw.slice(0, 120)}`);
      }

      // n8n wraps workflow output in an array when using "Respond to Webhook"
      // Support both array and plain object shapes.
      const item: any = Array.isArray(data) ? data[0] : data;

      const text: string =
        (typeof item?.output === "string" && item.output.trim()) ||
        (typeof item?.text === "string" && item.text.trim()) ||
        "";

      if (!text) {
        throw new Error("n8n response missing 'output' field");
      }

      // audio is a Base64 string (no data-URL prefix) -- build a playable data URL
      let audioUrl: string | undefined;
      if (typeof item?.audio === "string" && item.audio.trim()) {
        const b64 = item.audio.trim();
        audioUrl = b64.startsWith("data:")
          ? b64
          : `data:audio/mpeg;base64,${b64}`;
      }

      return { text, audioUrl };
    } catch (err: any) {
      // AbortError means timeout
      if (err?.name === "AbortError") {
        lastError = new Error(`n8n request timed out after ${TIMEOUT_MS / 1000}s`);
      } else {
        lastError = err instanceof Error ? err : new Error(String(err));
      }

      // Only retry on network / 5xx -- not on bad-JSON or missing-field errors
      const isRetryable =
        err?.name === "AbortError" ||
        err?.name === "TypeError" || // fetch network failure
        (err?.message ?? "").includes("HTTP 5");

      if (isRetryable && attempt < MAX_RETRIES) {
        console.warn(`[n8n] Attempt ${attempt + 1} failed (${lastError.message}), retrying...`);
        await sleep(800 * (attempt + 1));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError;
}

/**
 * Play the Base64 (or data-URL) audio returned by n8n.
 * Returns an object with abort() and the HTMLAudioElement so the caller can stop playback.
 */
export function playN8nAudio(
  audioUrl: string,
  onStart: () => void,
  onEnd: () => void,
  onError: (err: string) => void,
): { abort: () => void; audio: HTMLAudioElement } | null {
  if (!audioUrl) {
    onError("No audio URL provided");
    return null;
  }

  try {
    const src = audioUrl.startsWith("data:")
      ? audioUrl
      : `data:audio/mpeg;base64,${audioUrl}`;

    const audio = new Audio(src);
    let aborted = false;

    audio.oncanplaythrough = () => {
      if (!aborted) {
        audio.play().catch((err) => onError(String(err)));
      }
    };
    audio.onplay = () => { if (!aborted) onStart(); };
    audio.onended = () => { if (!aborted) onEnd(); };
    audio.onerror = () => {
      if (!aborted) onError("Audio playback error");
    };

    const abort = () => {
      aborted = true;
      audio.pause();
      audio.src = "";
      onEnd();
    };

    return { abort, audio };
  } catch (err) {
    onError(String(err));
    return null;
  }
}

// --- helpers ---

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
