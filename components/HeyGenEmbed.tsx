// components/HeyGenEmbed.tsx
"use client";

import { useEffect } from "react";

export function HeyGenEmbed() {
  useEffect(() => {
    const host = "https://labs.heygen.com";
    const url =
      host +
      "/guest/streaming-embed?share=eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiJKdWR5X0xhd3llcl9TaXR0aW5nMl9wdWJs%0D%0AaWMiLCJwcmV2aWV3SW1nIjoiaHR0cHM6Ly9maWxlczIuaGV5Z2VuLmFpL2F2YXRhci92My9hN2M4%0D%0ANmNiNzdiMzE0NDk0OGJmODAyMGY2ZTczNGJiZl80NTY0MC9wcmV2aWV3X3RhbGtfMS53ZWJwIiwi%0D%0AbmVlZFJlbW92ZUJhY2tncm91bmQiOmZhbHNlLCJrbm93bGVkZ2VCYXNlSWQiOiI0OGVjMDJhZTQ1%0D%0ANWQ0YzQ3YWMzMTA1MTIwYzUyYzU0NSIsInVzZXJuYW1lIjoiZjk3N2RhYzgyMjY2NDNjYmIxZTgx%0D%0AZTA1YmUwYzhmYTUifQ%3D%3D&inIFrame=1";

    const clientWidth = document.body.clientWidth;
    const wrapDiv = document.createElement("div");
    wrapDiv.id = "heygen-streaming-embed";

    const container = document.createElement("div");
    container.id = "heygen-streaming-container";

    const stylesheet = document.createElement("style");
    stylesheet.innerHTML = `
      #heygen-streaming-embed {
        z-index: 9999;
        position: fixed;
        left: 40px;
        bottom: 40px;
        width: 200px;
        height: 200px;
        border-radius: 50%;
        border: 2px solid #fff;
        box-shadow: 0px 8px 24px 0px rgba(0, 0, 0, 0.12);
        transition: all linear 0.1s;
        overflow: hidden;
        opacity: 0;
        visibility: hidden;
      }
      #heygen-streaming-embed.show {
        opacity: 1;
        visibility: visible;
      }
      #heygen-streaming-embed.expand {
        ${
          clientWidth < 540
            ? "height: 266px; width: 96%; left: 50%; transform: translateX(-50%);"
            : "height: 366px; width: calc(366px * 16 / 9);"
        }
        border: 0;
        border-radius: 8px;
      }
      #heygen-streaming-container {
        width: 100%;
        height: 100%;
      }
      #heygen-streaming-container iframe {
        width: 100%;
        height: 100%;
        border: 0;
      }
    `;

    const iframe = document.createElement("iframe");
    iframe.allowFullscreen = false;
    iframe.title = "Streaming Embed";
    iframe.role = "dialog";
    iframe.allow = "microphone";
    iframe.src = url;

    container.appendChild(iframe);
    wrapDiv.appendChild(stylesheet);
    wrapDiv.appendChild(container);
    document.body.appendChild(wrapDiv);

    // Optional: listen to iframe events
    window.addEventListener("message", (e) => {
      if (e.origin === host && e.data?.type === "streaming-embed") {
        if (e.data.action === "init") wrapDiv.classList.toggle("show", true);
        if (e.data.action === "show") wrapDiv.classList.toggle("expand", true);
        if (e.data.action === "hide") wrapDiv.classList.toggle("expand", false);
      }
    });
  }, []);

  return null; // this component doesn't render anything itself
}
