"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/utils/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { login } = useAuth();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handlePasswordBlur = () => {
    if (password.length < 8) {
      setPasswordError("비밀번호는 8자 이상이어야 합니다.");
    } else {
      setPasswordError("");
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailBlur = () => {
    if (!validateEmail(email)) {
      setEmailError("이메일 형식으로 작성해 주세요.");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
  
    if (!emailError && !passwordError && email && password) {
      try {
        console.log("🔍 로그인 요청:", email, password);
        await login(email, password);
        console.log("✅ 로그인 요청 성공");
        window.location.href = "/";
      } catch (error) {
        console.error("🚨 로그인 요청 실패:", error);
        setLoginError("로그인에 실패했습니다. 이메일과 비밀번호를 확인하세요.");
      }
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-[#ECEFF4] font-sans">
      {/* 상단 로고 */}
      <div className="bg-[#ffffff] w-full py-4 flex justify-center border-b border-[#E5E8EB]">
        <Image
          src="/epigram_image/ic_epigram.svg"
          alt="Epigram Logo"
          width={150}
          height={32}
          priority
        />
      </div>

      {/* 로그인 박스 */}
      <div className="w-[360px] bg-[#ECEFF4] shadow-md rounded-lg p-6 mt-10 text-center">
        <Image
          src="/epigram_image/ic_epigram.svg"
          alt="Epigram Logo"
          width={120}
          height={24}
          className="mx-auto mb-4"
        />

        <p className="text-[16px] text-gray-600">
          회원이 아니신가요?
          <Link href="/signup" className="ml-1 font-semibold text-[#6D6AFE] hover:underline">
            가입하기
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          {/* 이메일 입력 */}
          <div className="mb-4 text-left">
            <label htmlFor="email" className="block mb-2 text-gray-700 text-sm">
              이메일
            </label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleEmailBlur}
              placeholder="이메일을 입력하세요"
              autoComplete="off"
              className={`w-full h-12 px-4 border rounded-lg text-sm focus:border-[#6D6AFE] focus:outline-none ${
                emailError ? "border-red-500" : "border-gray-300"
              }`}
            />
            {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
          </div>

          {/* 비밀번호 입력 */}
          <div className="mb-4 text-left relative">
            <label htmlFor="password" className="block mb-2 text-gray-700 text-sm">
              비밀번호
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={handlePasswordBlur}
                placeholder="비밀번호를 입력하세요"
                className={`w-full h-12 px-4 border rounded-lg text-sm focus:border-[#6D6AFE] focus:outline-none ${
                  passwordError ? "border-red-500" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute top-1/2 right-4 -translate-y-1/2 bg-none border-none cursor-pointer"
                aria-label="비밀번호 보기/숨기기"
              >
                <Image
                  src={showPassword ? "/icons/ic_eye_off.svg" : "/icons/ic_eye_on.svg"}
                  alt="비밀번호 보기/숨기기"
                  width={18}
                  height={18}
                />
              </button>
            </div>
            {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            className="w-full h-12 bg-[#CBD3E1] text-gray-600 text-lg font-semibold rounded-lg mt-2 hover:bg-[#6D6AFE] hover:text-white transition"
          >
            로그인
          </button>
          {loginError && <p className="text-red-500 text-xs mt-2">{loginError}</p>}
        </form>
      </div>
    </div>
  );
}