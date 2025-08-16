"use client";

import {
  AvatarQuality,
  StreamingEvents,
  VoiceChatTransport,
  VoiceEmotion,
  StartAvatarRequest,
  STTProvider,
  ElevenLabsModel,
} from "@heygen/streaming-avatar";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";

import { Button } from "./Button";
import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { AvatarControls } from "./AvatarSession/AvatarControls";
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { useVoiceChat } from "./logic/useVoiceChat";
import { StreamingAvatarProvider, StreamingAvatarSessionState } from "./logic";
import { LoadingIcon } from "./Icons";
import { MessageHistory } from "./AvatarSession/MessageHistory";

import { AVATARS } from "@/app/lib/constants";
import { useAvatar } from "@/context/AvatarContext"; // ✅ NEW

// Helper: convert ArrayBuffer to base64
function bufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper: call server API to log messages
async function logMessage(role: string, text?: string, audio?: string) {
  await fetch("/api/log_interview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, text, audio }),
  });
}

export default function InteractiveAvatarWrapper() {
  return (
    <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
      <InteractiveAvatar />
    </StreamingAvatarProvider>
  );
}

function InteractiveAvatar() {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } =
    useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();

  const mediaStream = useRef<HTMLVideoElement>(null);

  // ✅ use global avatar selection from context
  const { selectedAvatarId } = useAvatar();

  const [config, setConfig] = useState<StartAvatarRequest>({
    quality: AvatarQuality.Low,
    avatarName: AVATARS[0].avatar_id,
    knowledgeId: "48ec02ae455d4c47ac3105120c52c545",
    voice: {
      rate: 1.5,
      emotion: VoiceEmotion.EXCITED,
      model: ElevenLabsModel.eleven_flash_v2_5,
    },
    language: "en",
    voiceChatTransport: VoiceChatTransport.WEBSOCKET,
    sttSettings: { provider: STTProvider.DEEPGRAM },
  });

  // ✅ Update config whenever avatar is changed globally
  useEffect(() => {
    if (selectedAvatarId) {
      setConfig((prev) => ({ ...prev, avatarName: selectedAvatarId }));
    }
  }, [selectedAvatarId]);

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", { method: "POST" });
      return await response.text();
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  const startSession = useMemoizedFn(async (isVoiceChat: boolean) => {
    try {
      const token = await fetchAccessToken();
      const avatar = initAvatar(token);

      // Log session start
      logMessage("system", `Session started with avatar: ${selectedAvatarId}`);

      // Standard message events
      avatar.on(StreamingEvents.USER_TALKING_MESSAGE, (e: any) => {
        console.log("User talking:", e.detail.message);
        logMessage("user", e.detail.message);
      });

      avatar.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (e: any) => {
        console.log("Avatar talking:", e.detail.message);
        logMessage("avatar", e.detail.message);
      });

      // Audio events
      avatar.on("USER_AUDIO_CHUNK" as any, (e: any) => {
        const base64Audio = bufferToBase64(e.detail.audio as ArrayBuffer);
        logMessage("user", undefined, base64Audio);
      });

      avatar.on("AVATAR_AUDIO_CHUNK" as any, (e: any) => {
        const base64Audio = bufferToBase64(e.detail.audio as ArrayBuffer);
        logMessage("avatar", undefined, base64Audio);
      });

      await startAvatar(config);
      if (isVoiceChat) await startVoiceChat();
    } catch (error) {
      console.error("Error starting avatar session:", error);
    }
  });

  useUnmount(() => stopAvatar());

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => mediaStream.current!.play();
    }
  }, [stream]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Avatar selector removed here ✅, since NavBar controls it */}
      
      {/* Avatar video / buttons */}
      <div className="flex flex-col rounded-xl bg-zinc-900 overflow-hidden">
        <div className="relative w-full aspect-video overflow-hidden flex flex-col items-center justify-center">
          {sessionState !== StreamingAvatarSessionState.INACTIVE ? (
            <AvatarVideo ref={mediaStream} />
          ) : (
            <div className="flex flex-row gap-4">
              <Button onClick={() => startSession(true)}>Start Voice Chat</Button>
              <Button onClick={() => startSession(false)}>Start Text Chat</Button>
            </div>
          )}
        </div>
        {sessionState === StreamingAvatarSessionState.CONNECTED && <AvatarControls />}
      </div>

      {sessionState === StreamingAvatarSessionState.CONNECTED && <MessageHistory />}
    </div>
  );
}
