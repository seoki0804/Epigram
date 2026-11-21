"use client";

import { useEffect, useState } from "react";
import { Emotion, errorMessage, getTodayEmotion, saveTodayEmotion } from "@/api/api";
import { EMOTIONS } from "@/lib/emotion";

/** 오늘의 감정을 고르고 저장한다. 하루에 하나, 다시 고르면 바뀐다. */
export default function EmotionPicker({ userId, onSaved }: { userId: number; onSaved?: () => void }) {
  const [selected, setSelected] = useState<Emotion | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getTodayEmotion(userId)
      .then((log) => setSelected(log?.emotion ?? null))
      .catch(() => setSelected(null));
  }, [userId]);

  const choose = async (emotion: Emotion) => {
    if (saving) return;
    setSaving(true);
    setMessage("");
    try {
      await saveTodayEmotion(emotion);
      setSelected(emotion);
      setMessage("오늘의 감정을 기록했어요.");
      onSaved?.();
    } catch (err) {
      setMessage(errorMessage(err, "감정을 저장하지 못했습니다."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <ul className="grid grid-cols-5 gap-2 sm:gap-3" role="radiogroup" aria-label="오늘의 감정">
        {EMOTIONS.map((e) => {
          const on = selected === e.key;
          return (
            <li key={e.key}>
              <button
                type="button"
                role="radio"
                aria-checked={on}
                disabled={saving}
                onClick={() => choose(e.key)}
                className={`flex w-full flex-col items-center gap-1.5 rounded-2xl border bg-surface py-3 transition sm:py-4 ${
                  on ? "border-brand ring-2 ring-brand/20" : "border-line hover:border-faint"
                }`}
              >
                <span className="text-2xl sm:text-3xl" aria-hidden>
                  {e.emoji}
                </span>
                <span className={`text-xs sm:text-sm ${on ? "font-semibold text-brand" : "text-sub"}`}>{e.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 min-h-5 text-sm text-sub" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
