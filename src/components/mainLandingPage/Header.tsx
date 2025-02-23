"use client";

import { useState, useEffect } from "react";
import "@/styles/globals.css";
import Image from "next/image";
import Logo from "../../../public/epigram_image/ic_epigram.svg";
import Link from "next/link";
import LoginButton from "./LoginButton";

export default function Header() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("accessToken"));
  }, []);

  return (
    <div className="w-full bg-[#F5F7FA] flex justify-between items-center py-4 px-8 border-b border-gray-300">
      {/* 왼쪽 로고 & 네비게이션 */}
      <div className="flex items-center gap-6">
        <Link href="/">
          <Image src={Logo} alt="로고" width={120} height={24} />
        </Link>
        {/* ✅ 로그인 상태에 따라 피드 버튼 경로 변경 */}
        <Link
          href={token ? "/epigramlist" : "/login"}
          className="text-gray-700 text-sm font-medium"
        >
          피드
        </Link>
      </div>

      {/* 오른쪽 로그인 상태에 따른 UI 변경 */}
      <div className="flex items-center gap-3">
        <LoginButton />
      </div>
    </div>
  );
}