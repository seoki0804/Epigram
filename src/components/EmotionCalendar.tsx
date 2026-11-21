"use client";

import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, startOfMonth } from "date-fns";
import type { EmotionLog } from "@/api/api";
import { EMOTIONS, emotionOf } from "@/lib/emotion";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

interface Props {
  month: Date;
  logs: EmotionLog[];
  onMonthChange: (next: Date) => void;
}

/** 한 달 동안 기록한 감정을 달력으로 보여 준다. */
export function EmotionCalendar({ month, logs, onMonthChange }: Props) {
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  const lead = getDay(days[0]);
  // 서버는 감정을 UTC 날짜(00:00Z)로 저장한다. 날짜 경계를 서버와 맞춰야 기록이 엉뚱한 칸에 찍히지 않는다.
  const byDay = new Map(logs.map((l) => [l.createdAt.slice(0, 10), l.emotion]));
  const todayKey = new Date().toISOString().slice(0, 10);

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <button type="button" className="btn-ghost px-3 py-1.5" aria-label="이전 달" onClick={() => onMonthChange(addMonths(month, -1))}>
          ‹
        </button>
        <p className="font-semibold text-ink">{format(month, "yyyy년 M월")}</p>
        <button type="button" className="btn-ghost px-3 py-1.5" aria-label="다음 달" onClick={() => onMonthChange(addMonths(month, 1))}>
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-faint">
        {WEEK.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: lead }, (_, i) => (
          <div key={`lead-${i}`} />
        ))}
        {days.map((d) => {
          const key = format(d, "yyyy-MM-dd");
          const emotion = byDay.get(key);
          const e = emotion ? emotionOf(emotion) : null;
          const isToday = key === todayKey;
          return (
            <div
              key={d.toISOString()}
              className={`flex aspect-square flex-col items-center justify-center rounded-xl text-sm ${
                isToday ? "ring-1 ring-brand" : ""
              } ${e ? "bg-paper" : ""}`}
              title={e ? `${format(d, "M월 d일")} ${e.label}` : undefined}
            >
              {e ? (
                <span className="text-xl leading-none" role="img" aria-label={e.label}>
                  {e.emoji}
                </span>
              ) : (
                <span className={isToday ? "font-semibold text-brand" : "text-sub"}>{format(d, "d")}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 감정 비율 도넛. 기록이 없으면 안내 문구를 보여 준다. */
export function EmotionDonut({ logs }: { logs: EmotionLog[] }) {
  const total = logs.length;
  const counts = EMOTIONS.map((e) => ({ ...e, n: logs.filter((l) => l.emotion === e.key).length })).sort(
    (a, b) => b.n - a.n
  );
  const top = counts[0];
  const R = 52;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5">
      <p className="font-semibold text-ink">감정 비율</p>
      {total === 0 ? (
        <p className="m-auto py-10 text-center text-sm text-sub">이 달에 기록한 감정이 없어요.</p>
      ) : (
        <div className="mt-4 flex flex-1 flex-col items-center gap-6 sm:flex-row">
          <svg viewBox="0 0 140 140" className="h-36 w-36 shrink-0" role="img" aria-label={`가장 많은 감정: ${top.label}`}>
            <circle cx="70" cy="70" r={R} fill="none" stroke="#EEF1F5" strokeWidth="16" />
            {counts
              .filter((c) => c.n > 0)
              .map((c) => {
                const len = (c.n / total) * C;
                const seg = (
                  <circle
                    key={c.key}
                    cx="70"
                    cy="70"
                    r={R}
                    fill="none"
                    stroke={c.color}
                    strokeWidth="16"
                    strokeDasharray={`${len} ${C - len}`}
                    strokeDashoffset={-offset}
                    transform="rotate(-90 70 70)"
                  />
                );
                offset += len;
                return seg;
              })}
            <text x="70" y="66" textAnchor="middle" fontSize="26">
              {top.emoji}
            </text>
            <text x="70" y="92" textAnchor="middle" fontSize="13" fill="#1F2430" fontWeight="600">
              {top.label}
            </text>
          </svg>
          <ul className="w-full space-y-2 text-sm">
            {counts.map((c) => (
              <li key={c.key} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                <span className="w-5 text-center" aria-hidden>
                  {c.emoji}
                </span>
                <span className="flex-1 text-sub">{c.label}</span>
                <span className="tabular-nums text-ink">{Math.round((c.n / total) * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
