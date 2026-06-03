"use client";

import { useEffect, useId, useRef } from "react";

/**
 * In-page torrent stream/download via webtor.io.
 *
 * webtor does the torrenting on its own infrastructure and renders inside an
 * iframe it injects into our container — the file bytes go webtor/peers →
 * the user's browser directly. PKGVault never proxies or stores anything.
 *
 * The SDK reads a global `window.webtor` queue and mounts a player into the
 * element whose id we pass.
 */
const SDK_SRC = "https://cdn.jsdelivr.net/npm/@webtor/embed-sdk-js/dist/index.min.js";

interface WebtorQueue {
  push: (config: Record<string, unknown>) => void;
}
declare global {
  interface Window {
    webtor?: WebtorQueue | Array<Record<string, unknown>>;
  }
}

export function WebtorEmbed({ magnet }: { magnet: string }) {
  const reactId = useId();
  const containerId = `webtor-${reactId.replace(/[:]/g, "")}`;
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    // Load the SDK once.
    if (!document.querySelector("script[data-webtor-sdk]")) {
      const script = document.createElement("script");
      script.src = SDK_SRC;
      script.async = true;
      script.setAttribute("data-webtor-sdk", "true");
      document.body.appendChild(script);
    }

    window.webtor = window.webtor || [];
    (window.webtor as Array<Record<string, unknown>>).push({
      id: containerId,
      magnet,
      width: "100%",
      height: 360,
      features: {
        // Keep it a download/stream surface — no social/embed chrome.
        embed: false,
        settings: true,
      },
    });
  }, [magnet, containerId]);

  return (
    <div
      id={containerId}
      style={{
        minHeight: 360,
        borderRadius: "var(--radius-base)",
        overflow: "hidden",
        background: "rgba(0,0,0,0.25)",
      }}
    />
  );
}
