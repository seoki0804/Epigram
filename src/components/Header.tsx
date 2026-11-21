"use client";

import Image from "next/image";
import Link from "next/link";
import Logo from "../../public/epigram_image/ic_epigram.svg";
import LoginButton from "./mainLandingPage/LoginButton";
import { useAuth } from "@/utils/AuthContext";

/** 모든 화면이 같이 쓰는 상단 바. 피드는 로그인 없이도 볼 수 있고, 글쓰기는 로그인한 사람에게만 보인다. */
export default function Header() {
  const { user } = useAuth();

  return (
    <header className="w-full bg-[#F5F7FA] flex justify-between items-center py-4 px-4 sm:px-8 border-b border-gray-300">
      <nav className="flex items-center gap-6">
        <Link href="/" aria-label="Epigram 홈">
          <Image src={Logo} alt="Epigram" width={120} height={24} />
        </Link>
        <Link href="/epigramlist" className="text-gray-500 text-sm font-medium hover:text-black">
          피드
        </Link>
        {user && (
          <Link href="/addepigram" className="text-gray-500 text-sm font-medium hover:text-black">
            글쓰기
          </Link>
        )}
      </nav>
      <LoginButton />
    </header>
  );
}
