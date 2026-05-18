"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
};

type SpeechRecognitionResultEvent = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      0: { transcript: string };
    };
  };
};

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const win = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}

export type SpeechDictationStatus = "idle" | "listening" | "unsupported" | "error";

export function useSpeechDictation(input: {
  lang: string;
  onFinalTranscript: (text: string) => void;
  disabled?: boolean;
}) {
  const { lang, onFinalTranscript, disabled } = input;
  const [status, setStatus] = useState<SpeechDictationStatus>("idle");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const listeningRef = useRef(false);
  const onFinalRef = useRef(onFinalTranscript);

  useEffect(() => {
    onFinalRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  useEffect(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setStatus("unsupported");
      return;
    }

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event) => {
      let finalChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result?.isFinal) {
          finalChunk += result[0]?.transcript ?? "";
        }
      }
      const trimmed = finalChunk.trim();
      if (trimmed) {
        onFinalRef.current(trimmed);
      }
    };

    recognition.onend = () => {
      if (listeningRef.current) {
        try {
          recognition.start();
        } catch {
          listeningRef.current = false;
          setStatus("idle");
        }
        return;
      }
      setStatus("idle");
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted" || event.error === "no-speech") {
        return;
      }
      listeningRef.current = false;
      setStatus(event.error === "not-allowed" ? "error" : "idle");
    };

    recognitionRef.current = recognition;

    return () => {
      listeningRef.current = false;
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      try {
        recognition.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    };
  }, [lang]);

  const stop = useCallback(() => {
    listeningRef.current = false;
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      recognition.stop();
    } catch {
      // ignore
    }
    setStatus((current) => (current === "listening" ? "idle" : current));
  }, []);

  const start = useCallback(() => {
    if (disabled || status === "unsupported") return;
    const recognition = recognitionRef.current;
    if (!recognition) return;

    try {
      listeningRef.current = true;
      recognition.lang = lang;
      recognition.start();
      setStatus("listening");
    } catch {
      listeningRef.current = false;
      setStatus("error");
    }
  }, [disabled, lang, status]);

  const toggle = useCallback(() => {
    if (status === "listening") {
      stop();
    } else {
      start();
    }
  }, [start, status, stop]);

  useEffect(() => {
    if (disabled && status === "listening") {
      stop();
    }
  }, [disabled, status, stop]);

  return {
    status,
    isListening: status === "listening",
    isSupported: status !== "unsupported",
    start,
    stop,
    toggle,
  };
}
