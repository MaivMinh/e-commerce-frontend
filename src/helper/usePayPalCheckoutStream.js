import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../services/apiClient";
import { keycloak } from "../services/keycloak";

const STREAM_ERROR_MESSAGE = "Không thể kết nối payment stream";

// Minimal SSE parser that consumes a fetch ReadableStream and emits events
const createSSEParser = (onEvent) => {
  let buffer = "";

  const push = (chunk) => {
    buffer += chunk;
    let index;
    // Process complete events separated by double newline
    while ((index = buffer.indexOf("\n\n")) !== -1) {
      const raw = buffer.slice(0, index).trim();
      buffer = buffer.slice(index + 2);
      const lines = raw.split(/\r?\n/);
      let event = "message";
      let data = "";
      for (const line of lines) {
        if (line.startsWith("event:")) {
          event = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          data += line.slice(5).trim() + "\n";
        }
      }
      if (data.endsWith("\n")) data = data.slice(0, -1);
      onEvent({ event, data });
    }
  };

  return { push };
};

export const usePayPalCheckoutStream = ({
  enabled,
  connectionKey = 0,
  onConnected,
  onRedirect,
  onError,
}) => {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);
  const callbacksRef = useRef({ onConnected, onRedirect, onError });

  useEffect(() => {
    callbacksRef.current = { onConnected, onRedirect, onError };
  }, [onConnected, onError, onRedirect]);

  useEffect(() => {
    if (!enabled) {
      // cleanup any running fetch
      if (controllerRef.current) {
        controllerRef.current.abort();
        controllerRef.current = null;
      }
      setStatus("idle");
      setError(null);
      return undefined;
    }

    const accessToken = keycloak.token || localStorage.getItem("kc_token");
    if (!accessToken) {
      setStatus("error");
      setError(STREAM_ERROR_MESSAGE);
      callbacksRef.current.onError?.(STREAM_ERROR_MESSAGE);
      return undefined;
    }

    // Prefer fetch streaming so we can send Authorization header
    const url = `${API_BASE_URL}api/payments/paypal/stream`;
    const headers = new Headers({
      Accept: "text/event-stream",
      Authorization: `Bearer ${accessToken}`,
    });

    controllerRef.current = new AbortController();
    const signal = controllerRef.current.signal;

    let connected = false;

    const run = async () => {
      setStatus("connecting");
      setError(null);
      console.log("[SSE] Connecting to PayPal stream...", url);

      try {
        const res = await fetch(url, { method: "GET", headers, signal });
        if (!res.ok) {
          console.error("[SSE] Failed to connect, status:", res.status);
          throw new Error(`SSE status ${res.status}`);
        }
        console.log("[SSE] Stream connected successfully");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        const parser = createSSEParser(({ event, data }) => {
          console.log("[SSE] Received event:", event, "data:", data);
          if (!connected) {
            connected = true;
            setStatus("connected");
            console.log("[SSE] Stream marked as connected");
            callbacksRef.current.onConnected?.();
          }

          if (event === "paypal-redirect") {
            let payload = null;
            try {
              payload = JSON.parse(data);
              console.log("[SSE] Parsed paypal-redirect payload:", payload);
            } catch {
              console.error("[SSE] Failed to parse payload data");
              return;
            }
            callbacksRef.current.onRedirect?.(payload);
          }

          if (event === "connected") {
            console.log("[SSE] Received connected event");
            callbacksRef.current.onConnected?.();
          }
        });

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          parser.push(chunk);
        }

        // stream ended
        console.log("[SSE] Stream ended unexpectedly");
        setStatus("error");
        setError(STREAM_ERROR_MESSAGE);
        callbacksRef.current.onError?.(STREAM_ERROR_MESSAGE);
      } catch (err) {
        if (signal.aborted) return;
        console.error("[SSE] Stream error:", err?.message);
        setStatus("error");
        setError(err?.message || STREAM_ERROR_MESSAGE);
        callbacksRef.current.onError?.(err?.message || STREAM_ERROR_MESSAGE);
      }
    };

    run();

    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
        controllerRef.current = null;
      }
    };
  }, [connectionKey, enabled]);

  // Fallback API to allow external close
  const closeStream = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
      setStatus("idle");
    }
  };

  return {
    status,
    error,
    closeStream,
  };
};