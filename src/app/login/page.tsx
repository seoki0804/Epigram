"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell, { PasswordInput } from "@/components/AuthShell";
import { useAuth } from "@/utils/AuthContext";
import { errorMessage } from "@/api/api";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => ({
    email: EMAIL.test(email) ? undefined : "이메일 형식으로 입력해 주세요.",
    password: password.length >= 8 ? undefined : "비밀번호는 8자 이상입니다.",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (found.email || found.password) return;
    setSubmitting(true);
    try {
      await login(email, password);
      // 로그인이 필요해서 넘어온 경우에는 원래 보던 화면으로 돌려보낸다. 다른 사이트 주소는 받지 않는다.
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : "/main");
    } catch (err) {
      setErrors({ form: errorMessage(err, "이메일 또는 비밀번호를 확인해 주세요.") });
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="로그인"
      footer={
        <>
          회원이 아니신가요?{" "}
          <Link href="/signup" className="font-semibold text-brand">
            가입하기
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
            onBlur={() => setErrors((s) => ({ ...s, email: validate().email }))}
            placeholder="you@example.com"
            className={`field ${errors.email ? "border-red" : ""}`}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="password" className="label">
            비밀번호
          </label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8자 이상"
            invalid={!!errors.password}
          />
          {errors.password && <p className="error-text">{errors.password}</p>}
        </div>
        {errors.form && <p className="error-text">{errors.form}</p>}
        <button type="submit" disabled={submitting} className="btn-primary mt-1 w-full py-3.5 text-base">
          {submitting ? "로그인 중…" : "로그인"}
        </button>
      </form>
    </AuthShell>
  );
}
