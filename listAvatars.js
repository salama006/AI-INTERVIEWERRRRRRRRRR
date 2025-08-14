// listAvatars.js
import fetch from "node-fetch";
import inquirer from "inquirer";
import fs from "fs";
import "dotenv/config";

const API_KEY = process.env.HEYGEN_API_KEY;
const AVATAR_LIST_FILE = "v3_avatars.json";
const SELECTED_AVATAR_FILE = "selected_avatar.json";

if (!API_KEY) {
  console.error("❌ Missing HEYGEN_API_KEY in .env");
  process.exit(1);
}

async function fetchAvatars() {
  try {
    const response = await fetch("https://api.heygen.com/v2/avatars", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Error fetching avatars: ${response.status} ${text}`);
    }

    const data = await response.json();
    return data.data?.avatars || [];
  } catch (err) {
    console.error("❌ Fetch failed:", err.message);
    return [];
  }
}

async function chooseAvatar(avatars) {
  if (!avatars.length) {
    console.warn("⚠️ No avatars found.");
    return null;
  }

  fs.writeFileSync(AVATAR_LIST_FILE, JSON.stringify(avatars, null, 2));
  console.log(`📁 Saved ${avatars.length} avatars to ${AVATAR_LIST_FILE}`);

  const choices = avatars.map((a) => ({
    name: a.name || a.avatar_id,
    value: a.avatar_id,
  }));

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "avatarId",
      message: "Select your avatar:",
      choices,
      pageSize: 15,
    },
  ]);

  const selected = avatars.find((a) => a.avatar_id === answers.avatarId);
  fs.writeFileSync(SELECTED_AVATAR_FILE, JSON.stringify(selected, null, 2));
  console.log(
    `✅ Default avatar selected: ${selected.avatar_id} | saved to ${SELECTED_AVATAR_FILE}`
  );

  return selected;
}

(async () => {
  console.log("📡 Fetching avatars from HeyGen...");
  const avatars = await fetchAvatars();
  await chooseAvatar(avatars);
})();




