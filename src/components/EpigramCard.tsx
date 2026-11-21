import Link from "next/link";
import type { Epigram } from "@/api/api";

interface Props {
  epigram: Epigram;
  /** 카드 오른쪽 위에 둘 메뉴 등 */
  action?: React.ReactNode;
  size?: "md" | "lg";
}

/** 줄 노트 위에 명조체로 적은 명언 카드. 여백과 줄 간격을 줄 높이의 배수로 둬서 글자가 선 위에 앉는다. */
export default function EpigramCard({ epigram, action, size = "md" }: Props) {
  const lg = size === "lg";
  return (
    <article className="group relative flex flex-col gap-2">
      <Link
        href={`/epigrams/${epigram.id}`}
        className={`lined block rounded-2xl border border-line bg-surface px-6 shadow-card transition group-hover:-translate-y-0.5 group-hover:border-faint ${
          lg ? "lined-lg py-9 sm:px-8" : "py-7"
        } ${action ? "pr-12" : ""}`}
      >
        <p className={`font-serif text-ink ${lg ? "text-xl leading-[36px] sm:text-2xl" : "text-[17px] leading-[28px]"}`}>
          {epigram.content}
        </p>
        <p className={`text-right font-serif text-sub ${lg ? "mt-9 text-base leading-[36px]" : "mt-7 text-[15px] leading-[28px]"}`}>
          — {epigram.author} —
        </p>
      </Link>
      {(epigram.tags.length > 0 || epigram.likeCount > 0) && (
        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 px-1 text-sm text-faint">
          {epigram.tags.map((t) => (
            <Link key={t.id} href={`/epigramlist?q=${encodeURIComponent(t.name)}`} className="hover:text-sub">
              #{t.name}
            </Link>
          ))}
          {epigram.likeCount > 0 && <span aria-label={`좋아요 ${epigram.likeCount}개`}>♥ {epigram.likeCount}</span>}
        </div>
      )}
      {action && <div className="absolute right-2 top-2">{action}</div>}
    </article>
  );
}
