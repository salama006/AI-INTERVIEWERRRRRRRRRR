// src/HeyGenInterviewer.jsx
import { useEffect, useRef, useState } from "react";
import selectedAvatar from "./selected_avatar.json";

function HeyGenInterviewer() {
  const videoRef = useRef(null);
  const pcRef = useRef(null); // store peerConnection
  const wsRef = useRef(null);
  const [status, setStatus] = useState("🔄 Connecting to HeyGen...");

  const avatarId =
    selectedAvatar?.avatar_id ||
    selectedAvatar?.avatar ||
    (typeof selectedAvatar === "string" ? selectedAvatar : null);

  useEffect(() => {
    if (!avatarId) {
      setStatus("❌ Missing avatar ID");
      return;
    }

    async function initHeyGen() {
      try {
        setStatus("🔌 Setting up WebRTC connection...");

        // 1️⃣ Create PeerConnection
        const pc = new RTCPeerConnection();
        pcRef.current = pc;

        // 2️⃣ Handle remote track from HeyGen
        pc.ontrack = (event) => {
          if (videoRef.current) videoRef.current.srcObject = event.streams[0];
        };

        // 3️⃣ Handle local ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "iceCandidate", candidate: event.candidate }));
          }
        };

        // 4️⃣ Connect to WebSocket proxy
        const ws = new WebSocket("ws://localhost:8000/ws-heygen");
        wsRef.current = ws;

        ws.onopen = async () => {
          setStatus("🔄 WebSocket connected, creating SDP offer...");

          // 5️⃣ Create SDP offer
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          // 6️⃣ Send SDP offer via WS
          ws.send(JSON.stringify({ type: "sdpOffer", sdp: offer.sdp, avatarId, greeting: "Hello! I am your AI interviewer." }));
        };

        ws.onmessage = async (event) => {
          const msg = JSON.parse(event.data);

          // Handle remote SDP answer
          if (msg.type === "sdpAnswer" && msg.sdp) {
            await pc.setRemoteDescription({ type: "answer", sdp: msg.sdp });
            setStatus("✅ Connected — avatar ready to speak!");
          }

          // Handle remote ICE candidates from HeyGen
          if (msg.type === "iceCandidate" && msg.candidate) {
            await pc.addIceCandidate(msg.candidate);
          }

          // Handle errors from backend
          if (msg.error) {
            setStatus(`❌ Connection failed — ${msg.error}`);
          }
        };

        ws.onclose = () => setStatus("⚠️ WebSocket closed");

      } catch (err) {
        console.error("❌ HeyGen init error:", err);
        setStatus(`❌ Connection failed — ${err.message || "Unknown error"}`);
      }
    }

    initHeyGen();

    return () => {
      // cleanup
      pcRef.current?.close();
      wsRef.current?.close();
    };
  }, [avatarId]);

  return (
    <div style={{ textAlign: "center", padding: "1rem" }}>
      <h1>🎤 AI Interviewer</h1>
      <p>{status}</p>

      <div style={{ position: "relative", display: "inline-block" }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: "480px", backgroundColor: "#000", borderRadius: "10px", marginBottom: "10px" }}
        />
        {avatarId && (
          <span
            style={{
              position: "absolute",
              bottom: "5px",
              left: "5px",
              color: "#fff",
              backgroundColor: "rgba(0,0,0,0.5)",
              padding: "2px 5px",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            {avatarId}
          </span>
        )}
      </div>

      {selectedAvatar?.preview_image_url && (
        <div style={{ marginTop: "10px" }}>
          <img
            src={selectedAvatar.preview_image_url}
            alt={selectedAvatar?.avatar_name || "Avatar Preview"}
            style={{ width: "240px", borderRadius: "8px", border: "2px solid #fff" }}
          />
        </div>
      )}
    </div>
  );
}

export default HeyGenInterviewer;









