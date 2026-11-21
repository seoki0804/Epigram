"use client";

import React, { useState } from "react";
import { EpigramInput } from "@/api/api";

type AuthorType = "direct" | "unknown" | "self";

const UNKNOWN_AUTHOR = "알 수 없음";
const URL_PATTERN = /^https?:\/\/.+/;

interface Props {
  title: string;
  submitLabel: string;
  nickname: string;
  initial?: EpigramInput;
  onSubmit: (input: EpigramInput) => Promise<void>;
}

function authorTypeOf(author: string | undefined, nickname: string): AuthorType {
  if (!author) return "direct";
  if (author === UNKNOWN_AUTHOR) return "unknown";
  if (author === nickname) return "self";
  return "direct";
}

/** 에피그램 만들기와 수정하기가 같이 쓰는 입력 폼. 검사 기준은 API 명세와 같다. */
export default function EpigramForm({ title, submitLabel, nickname, initial, onSubmit }: Props) {
  const startType = authorTypeOf(initial?.author, nickname);
  const [content, setContent] = useState(initial?.content ?? "");
  const [authorType, setAuthorType] = useState<AuthorType>(startType);
  const [author, setAuthor] = useState(startType === "direct" ? initial?.author ?? "" : "");
  const [referenceTitle, setReferenceTitle] = useState(initial?.referenceTitle ?? "");
  const [referenceUrl, setReferenceUrl] = useState(initial?.referenceUrl ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagDraft, setTagDraft] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const finalAuthor =
    authorType === "unknown" ? UNKNOWN_AUTHOR : authorType === "self" ? nickname : author.trim();

  const validate = () => {
    const next: Record<string, string> = {};
    if (!content.trim()) next.content = "내용을 입력해 주세요.";
    else if (content.length > 500) next.content = "내용은 500자 이내로 입력해 주세요.";
    if (!finalAuthor) next.author = "저자를 입력해 주세요.";
    else if (finalAuthor.length > 30) next.author = "저자는 30자 이내로 입력해 주세요.";
    if (referenceTitle.length > 100) next.reference = "출처 제목은 100자 이내로 입력해 주세요.";
    if (referenceUrl.trim() && !URL_PATTERN.test(referenceUrl.trim()))
      next.reference = "URL은 http:// 또는 https:// 로 시작해야 합니다.";
    return next;
  };

  const clearError = (key: string) =>
    setErrors((e) => {
      const rest = { ...e };
      delete rest[key];
      return rest;
    });

  const addTag = () => {
    const tag = tagDraft.trim().replace(/^#/, "");
    if (!tag) return;
    if (tag.length > 10) return setErrors((e) => ({ ...e, tags: "태그는 10자 이내로 입력해 주세요." }));
    if (tags.includes(tag)) return setErrors((e) => ({ ...e, tags: "이미 추가한 태그입니다." }));
    if (tags.length >= 3) return setErrors((e) => ({ ...e, tags: "태그는 3개까지 추가할 수 있습니다." }));
    setTags([...tags, tag]);
    setTagDraft("");
    clearError("tags");
  };

  const handleTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 한글 조합 중에 Enter 가 두 번 들어와 태그가 중복되는 문제를 막는다.
    if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
    e.preventDefault();
    addTag();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await onSubmit({ content, author: finalAuthor, referenceTitle, referenceUrl, tags });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-ink">{title}</h1>

      <div>
        <label className="label" htmlFor="content">
          내용 <span className="text-red">*</span>
        </label>
        <textarea
          id="content"
          className="field lined min-h-[180px] resize-y font-serif text-[17px] leading-[28px] [background-position:0_12px] [background-attachment:local]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="500자 이내로 입력해 주세요."
          maxLength={500}
        />
        <div className="mt-1.5 flex justify-between text-sm">
          <span className="text-red">{errors.content}</span>
          <span className="text-faint">{content.length} / 500</span>
        </div>
      </div>

      <fieldset>
        <legend className="label">
          저자 <span className="text-red">*</span>
        </legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="저자">
          {(
            [
              ["direct", "직접 입력"],
              ["unknown", "알 수 없음"],
              ["self", "본인"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition ${
                authorType === value ? "border-ink bg-ink text-white" : "border-line bg-surface text-sub hover:border-faint"
              }`}
            >
              <input
                type="radio"
                name="authorType"
                value={value}
                checked={authorType === value}
                onChange={() => setAuthorType(value)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
        {authorType === "direct" && (
          <input
            id="author"
            className="field mt-3"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="저자 이름 입력"
            maxLength={30}
            aria-label="저자 이름"
          />
        )}
        {authorType === "self" && <p className="mt-3 text-sm text-sub">저자: {nickname}</p>}
        {errors.author && <p className="error-text">{errors.author}</p>}
      </fieldset>

      <div>
        <label className="label" htmlFor="referenceTitle">
          출처 <span className="font-normal text-faint">(선택)</span>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            id="referenceTitle"
            className="field"
            type="text"
            value={referenceTitle}
            onChange={(e) => setReferenceTitle(e.target.value)}
            placeholder="출처 제목 (예: 논어 학이편)"
            maxLength={100}
          />
          <input
            id="referenceUrl"
            className="field"
            type="url"
            value={referenceUrl}
            onChange={(e) => setReferenceUrl(e.target.value)}
            placeholder="URL (https://…)"
            aria-label="출처 URL"
          />
        </div>
        {errors.reference && <p className="error-text">{errors.reference}</p>}
      </div>

      <div>
        <label className="label" htmlFor="tagDraft">
          태그 <span className="font-normal text-faint">(최대 3개, 10자 이내)</span>
        </label>
        <div className="flex gap-2">
          <input
            id="tagDraft"
            className="field"
            type="text"
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={handleTagKey}
            placeholder={tags.length >= 3 ? "태그를 모두 추가했어요" : "입력 후 Enter"}
            maxLength={11}
            disabled={tags.length >= 3}
          />
          <button type="button" className="btn-ghost shrink-0" onClick={addTag} disabled={tags.length >= 3}>
            추가
          </button>
        </div>
        {errors.tags && <p className="error-text">{errors.tags}</p>}
        {tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag} className="flex items-center gap-1 rounded-full bg-brand-soft py-1 pl-3 pr-1.5 text-sm text-brand">
                #{tag}
                <button
                  type="button"
                  aria-label={`${tag} 태그 삭제`}
                  onClick={() => setTags(tags.filter((t) => t !== tag))}
                  className="grid h-5 w-5 place-items-center rounded-full hover:bg-brand/10"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {submitError && <p className="error-text">{submitError}</p>}
      <button type="submit" className="btn-primary w-full py-3.5 text-base" disabled={submitting}>
        {submitting ? "저장 중…" : submitLabel}
      </button>
    </form>
  );
}
