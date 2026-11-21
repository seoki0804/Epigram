"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "../../public/epigram_image/ic_epigram.svg";
import { useAuth } from "@/utils/AuthContext";

const NAV = [
  { href: "/main", label: "메인", auth: true },
  { href: "/epigramlist", label: "피드", auth: false },
  { href: "/addepigram", label: "글쓰기", auth: true },
];

/** 모든 화면이 같이 쓰는 상단 바 */
export default function Header() {
  const { user, ready, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-5 sm:px-8">
        <nav className="flex items-center gap-6">
          <Link href={user ? "/main" : "/"} aria-label="Epigram 홈" className="shrink-0">
            <Image src={Logo} alt="Epigram" width={110} height={22} priority />
          </Link>
          <ul className="flex items-center gap-4 text-sm">
            {NAV.filter((n) => !n.auth || user).map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className={pathname.startsWith(n.href) ? "font-semibold text-ink" : "text-sub hover:text-ink"}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex min-w-0 items-center gap-3 text-sm">
          {!ready ? null : user ? (
            <>
              <Link
                href="/mypage"
                className="flex min-w-0 items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-paper"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                  {user.nickname.slice(0, 1)}
                </span>
                <span className="hidden truncate font-medium sm:inline">{user.nickname}</span>
              </Link>
              <button
                type="button"
                className="text-sub hover:text-ink"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sub hover:text-ink">
                로그인
              </Link>
              <Link href="/signup" className="btn-primary px-3.5 py-2">
                시작하기
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
