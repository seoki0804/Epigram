"use client";

import React, { useState } from "react";
import styles from "@/app/addepigram/addepigram.module.css";
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

  const addTag = () => {
    const tag = tagDraft.trim().replace(/^#/, "");
    if (!tag) return;
    if (tag.length > 10) return setErrors((e) => ({ ...e, tags: "태그는 10자 이내로 입력해 주세요." }));
    if (tags.includes(tag)) return setErrors((e) => ({ ...e, tags: "이미 추가한 태그입니다." }));
    if (tags.length >= 3) return setErrors((e) => ({ ...e, tags: "태그는 3개까지 추가할 수 있습니다." }));
    setTags([...tags, tag]);
    setTagDraft("");
    setErrors((e) => {
      const rest = { ...e };
      delete rest.tags;
      return rest;
    });
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
    <form className={styles.container} onSubmit={handleSubmit} noValidate>
      <h1 className={styles.title}>{title}</h1>

      <label className={styles.label} htmlFor="content">내용 *</label>
      <textarea
        id="content"
        className={styles.textarea}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="500자 이내로 입력해 주세요."
        maxLength={500}
      />
      <p className="text-right text-xs text-gray-400">{content.length} / 500</p>
      {errors.content && <p className={styles.error}>{errors.content}</p>}

      <span className={styles.label}>저자 *</span>
      <div className={styles.radioGroup} role="radiogroup" aria-label="저자">
        {(
          [
            ["direct", "직접 입력"],
            ["unknown", "알 수 없음"],
            ["self", "본인"],
          ] as const
        ).map(([value, label]) => (
          <label key={value}>
            <input
              type="radio"
              name="authorType"
              value={value}
              checked={authorType === value}
              onChange={() => setAuthorType(value)}
            />{" "}
            {label}
          </label>
        ))}
      </div>
      {authorType === "direct" && (
        <input
          id="author"
          className={styles.input}
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="저자 이름 입력"
          maxLength={30}
        />
      )}
      {authorType === "self" && <p className="text-sm text-gray-500 mt-1">저자: {nickname}</p>}
      {errors.author && <p className={styles.error}>{errors.author}</p>}

      <label className={styles.label} htmlFor="referenceTitle">출처</label>
      <input
        id="referenceTitle"
        className={styles.input}
        type="text"
        value={referenceTitle}
        onChange={(e) => setReferenceTitle(e.target.value)}
        placeholder="출처 제목 입력"
        maxLength={100}
      />
      <input
        id="referenceUrl"
        className={styles.input}
        type="url"
        value={referenceUrl}
        onChange={(e) => setReferenceUrl(e.target.value)}
        placeholder="URL (예: https://www.website.com)"
      />
      {errors.reference && <p className={styles.error}>{errors.reference}</p>}

      <label className={styles.label} htmlFor="tagDraft">태그 (최대 3개)</label>
      <input
        id="tagDraft"
        className={styles.input}
        type="text"
        value={tagDraft}
        onChange={(e) => setTagDraft(e.target.value)}
        onKeyDown={handleTagKey}
        placeholder="입력 후 Enter (10자 이내)"
        maxLength={11}
        disabled={tags.length >= 3}
      />
      {errors.tags && <p className={styles.error}>{errors.tags}</p>}
      <div className={styles.tagContainer}>
        {tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            #{tag}{" "}
            <button type="button" aria-label={`${tag} 태그 삭제`} onClick={() => setTags(tags.filter((t) => t !== tag))}>
              ×
            </button>
          </span>
        ))}
      </div>

      {submitError && <p className={styles.error}>{submitError}</p>}
      <button type="submit" className={styles.submitButton} disabled={submitting}>
        {submitting ? "저장 중..." : submitLabel}
      </button>
    </form>
  );
}
