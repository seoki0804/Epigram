import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { Comment } from "@/api/api";

/** 댓글 한 줄. linkToEpigram 이면 원글로 가는 링크가 붙는다. */
export default function CommentItem({
  comment,
  linkToEpigram = false,
  hideContent = false,
  children,
}: {
  comment: Comment;
  linkToEpigram?: boolean;
  /** 수정 중에는 본문 대신 입력칸(children)을 보여 준다 */
  hideContent?: boolean;
  children?: React.ReactNode;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="flex min-w-0 items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-paper text-xs font-bold text-sub">
            {comment.writer.nickname.slice(0, 1)}
          </span>
          <span className="truncate font-semibold text-ink">{comment.writer.nickname}</span>
          {comment.isPrivate && <span className="rounded-md bg-paper px-1.5 py-0.5 text-[11px] text-sub">비공개</span>}
        </span>
        <time className="shrink-0 text-xs text-faint" dateTime={comment.createdAt}>
          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ko })}
        </time>
      </div>
      {!hideContent && (
        <p className="mt-2 whitespace-pre-line pl-9 text-[15px] leading-relaxed text-ink">{comment.content}</p>
      )}
    </>
  );

  return (
    <li className="py-4">
      {linkToEpigram ? (
        <Link href={`/epigrams/${comment.epigramId}`} className="block rounded-xl hover:bg-paper/60">
          {body}
        </Link>
      ) : (
        body
      )}
      {children}
    </li>
  );
}
