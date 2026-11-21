"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import AuthShell, { PasswordInput } from "@/components/AuthShell";
import { errorMessage } from "@/api/api";
import { useAuth } from "@/utils/AuthContext";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD = /^[A-Za-z0-9!@#$%^&*]+$/; // API 명세와 같은 규칙

type Field = "email" | "nickname" | "password" | "confirm" | "form";

export default function Signup() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const check = (field: Exclude<Field, "form">) => {
    switch (field) {
      case "email":
        return EMAIL.test(email) ? undefined : "이메일 형식으로 입력해 주세요.";
      case "nickname":
        return !nickname.trim() ? "닉네임을 입력해 주세요." : nickname.length > 30 ? "닉네임은 30자 이내입니다." : undefined;
      case "password":
        if (password.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
        return PASSWORD.test(password) ? undefined : "영문, 숫자, 특수문자(!@#$%^&*)만 쓸 수 있어요.";
      case "confirm":
        return confirm && confirm === password ? undefined : "비밀번호가 일치하지 않습니다.";
    }
  };

  const blur = (field: Exclude<Field, "form">) => () => setErrors((s) => ({ ...s, [field]: check(field) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = {
      email: check("email"),
      nickname: check("nickname"),
      password: check("password"),
      confirm: check("confirm"),
    };
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    setSubmitting(true);
    try {
      // 가입 응답에 토큰이 같이 오므로 바로 로그인 상태로 메인에 들어간다.
      await register({ email, nickname: nickname.trim(), password, passwordConfirmation: confirm });
      router.replace("/main");
    } catch (err) {
      // 이 API는 이미 있는 이메일·닉네임이면 400이 아니라 500을 돌려준다.
      const duplicate = axios.isAxiosError(err) && (err.response?.status ?? 0) >= 500;
      setErrors({
        form: duplicate
          ? "이미 사용 중인 이메일이나 닉네임일 수 있어요. 다른 값으로 다시 시도해 주세요."
          : errorMessage(err, "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요."),
      });
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="회원가입"
      footer={
        <>
          이미 회원이신가요?{" "}
          <Link href="/login" className="font-semibold text-brand">
            로그인
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div>
          <label htmlFor="email" className="label">
            이메일
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={blur("email")}
            placeholder="you@example.com"
            className={`field ${errors.email ? "border-red" : ""}`}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="nickname" className="label">
            닉네임
          </label>
          <input
            id="nickname"
            type="text"
            autoComplete="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onBlur={blur("nickname")}
            placeholder="30자 이내"
            maxLength={30}
            className={`field ${errors.nickname ? "border-red" : ""}`}
          />
          {errors.nickname && <p className="error-text">{errors.nickname}</p>}
        </div>
        <div>
          <label htmlFor="password" className="label">
            비밀번호
          </label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={blur("password")}
            placeholder="영문·숫자·특수문자 8자 이상"
            invalid={!!errors.password}
          />
          {errors.password && <p className="error-text">{errors.password}</p>}
        </div>
        <div>
          <label htmlFor="confirm" className="label">
            비밀번호 확인
          </label>
          <PasswordInput
            id="confirm"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onBlur={blur("confirm")}
            placeholder="한 번 더 입력"
            invalid={!!errors.confirm}
          />
          {errors.confirm && <p className="error-text">{errors.confirm}</p>}
        </div>
        {errors.form && <p className="error-text">{errors.form}</p>}
        <button type="submit" disabled={submitting} className="btn-primary mt-1 w-full py-3.5 text-base">
          {submitting ? "가입 중…" : "가입하기"}
        </button>
      </form>
    </AuthShell>
  );
}
