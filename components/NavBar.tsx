"use client";

import { useAvatar } from "@/context/AvatarContext";

export default function NavBar() {
  const { selectedAvatarId, setSelectedAvatarId } = useAvatar();

  const avatars = [
    { id: "Judy_Lawyer_Sitting2_public", name: "Judy" },
    { id: "Other_Avatar_123", name: "Alex" },
  ];

  return (
    <nav className="p-4 flex justify-between items-center bg-gray-800 text-white">
      <h1 className="font-bold text-lg">AI Interviewer</h1>
      <div>
        <select
          value={selectedAvatarId ?? ""}
          onChange={(e) => setSelectedAvatarId(e.target.value)}
          className="text-black p-2 rounded"
        >
          <option value="" disabled>
            Select an Avatar
          </option>
          {avatars.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>
    </nav>
  );
}
