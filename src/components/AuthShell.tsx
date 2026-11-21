"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../public/epigram_image/ic_epigram.svg";

/** 로그인·회원가입이 같이 쓰는 가운데 카드 틀 */
export default function AuthShell({
  title,
  footer,
  children,
}: {
  title: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-16">
      <Link href="/" aria-label="Epigram 홈">
        <Image src={Logo} alt="Epigram" width={150} height={30} priority />
      </Link>
      <div className="mt-8 w-full max-w-sm rounded-3xl border border-line bg-surface p-7 shadow-card sm:p-8">
        <h1 className="text-xl font-bold text-ink">{title}</h1>
        <div className="mt-6">{children}</div>
      </div>
      <p className="mt-6 text-sm text-sub">{footer}</p>
    </main>
  );
}

/** 비밀번호 보기/숨기기 버튼이 붙은 입력칸 */
export function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  const [show, setShow] = useState(false);
  const { invalid, className, ...rest } = props;
  return (
    <div className="relative">
      <input
        {...rest}
        type={show ? "text" : "password"}
        className={`field pr-12 ${invalid ? "border-red" : ""} ${className ?? ""}`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg hover:bg-paper"
        aria-label={show ? "비밀번호 숨기기" : "비밀번호 보기"}
      >
        <Image src={show ? "/icons/ic_eye_off.svg" : "/icons/ic_eye_on.svg"} alt="" width={18} height={18} />
      </button>
    </div>
  );
}
