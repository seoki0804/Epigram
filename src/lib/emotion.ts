import type { Emotion } from "@/api/api";

export const EMOTIONS: { key: Emotion; label: string; emoji: string; color: string }[] = [
  { key: "MOVED", label: "감동", emoji: "🥹", color: "#F5A524" },
  { key: "HAPPY", label: "기쁨", emoji: "😊", color: "#3BB273" },
  { key: "WORRIED", label: "고민", emoji: "🤔", color: "#8B5CF6" },
  { key: "SAD", label: "슬픔", emoji: "😢", color: "#3D7DD8" },
  { key: "ANGRY", label: "분노", emoji: "😠", color: "#E5484D" },
];

export const emotionOf = (key: Emotion) => EMOTIONS.find((e) => e.key === key)!;
