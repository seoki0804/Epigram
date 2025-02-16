"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { postSignUp } from "../../api/api";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passworConfirmation, setPassworConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showpassworConfirmation, setShowpassworConfirmation] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState("");
  const [signupError, setSignupError] = useState<string | null>(null);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailBlur = () => {
    setEmailError(validateEmail(email) ? "" : "이메일 형식으로 작성해 주세요.");
  };

  const handlePasswordBlur = () => {
    setPasswordError(password.length >= 8 ? "" : "비밀번호는 8자 이상이어야 합니다.");
  };

  const handlepassworConfirmationBlur = () => {
    setPasswordMatchError(password === passworConfirmation ? "" : "비밀번호가 일치하지 않습니다.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (!emailError && !passwordError && !passwordMatchError && name) {
      try {
        await postSignUp(email, password, passworConfirmation, name);
        alert("회원가입이 완료되었습니다!");
        window.location.href = "/login";
      } catch (error) {
        console.error("회원가입 실패:", error);
        setSignupError("회원가입에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-[#ECEFF4] font-sans">
      {/* 상단 로고 추가 */}
      <div className="w-full bg-white py-4 flex justify-center border-b">
        <Image src="/epigram_image/ic_epigram.svg" alt="Logo" width={133} height={24} />
      </div>

      {/* 회원가입 폼 */}
      <div className="w-[325px] sm:w-[400px] bg-[#ECEFF4] rounded-[8px] text-center p-[24px] mt-6 shadow-md">
        <Link href="/" passHref className="flex justify-center mb-[16px]">
          <div>
            <Image src="/epigram_image/ic_epigram.svg" alt="Logo" width={210} height={38} priority />
          </div>
        </Link>
        <p className="text-[16px]">
          이미 회원이신가요?
          <Link href="/login" className="ml-[8px] font-semibold text-[#6D6AFE] underline">
            로그인 하기
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          {/* 이메일 입력 */}
          <div className="mb-[20px] text-left">
            <label htmlFor="email" className="block mb-[8px] text-[#333] text-[14px]">이메일</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleEmailBlur}
              placeholder="이메일 입력"
              className={`w-full h-[50px] px-4 border rounded-md ${emailError ? 'border-red-500' : 'border-gray-300'}`}
            />
            {emailError && <p className="text-red-500 text-[12px] mt-[4px]">{emailError}</p>}
          </div>

          {/* 이름 입력 */}
          <div className="mb-[20px] text-left">
            <label htmlFor="name" className="block mb-[8px] text-[#333] text-[14px]">이름</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름 입력"
              className="w-full h-[50px] px-4 border border-gray-300 rounded-md"
            />
          </div>

          {/* 비밀번호 입력 */}
          <div className="mb-[20px] text-left relative">
            <label htmlFor="password" className="block mb-[8px] text-[#333] text-[14px]">비밀번호</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={handlePasswordBlur}
                placeholder="비밀번호 입력"
                className={`w-full h-[50px] px-4 border rounded-md ${passwordError ? 'border-red-500' : 'border-gray-300'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2"
              >
                <Image src={showPassword ? "/icons/ic_eye_off.svg" : "/icons/ic_eye_on.svg"} alt="비밀번호 보기" width={16} height={16} />
              </button>
            </div>
            {passwordError && <p className="text-red-500 text-[12px] mt-[4px]">{passwordError}</p>}
          </div>

          {/* 비밀번호 확인 */}
          <div className="mb-[30px] text-left relative">
            <label htmlFor="passworConfirmation" className="block mb-[8px] text-[#333] text-[14px]">비밀번호 확인</label>
            <div className="relative">
              <input
                type={showpassworConfirmation ? "text" : "password"}
                id="passworConfirmation"
                value={passworConfirmation}
                onChange={(e) => setPassworConfirmation(e.target.value)}
                onBlur={handlepassworConfirmationBlur}
                placeholder="비밀번호 확인 입력"
                className={`w-full h-[50px] px-4 border rounded-md ${passwordMatchError ? 'border-red-500' : 'border-gray-300'}`}
              />
              <button
                type="button"
                onClick={() => setShowpassworConfirmation(!showpassworConfirmation)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2"
              >
                <Image src={showpassworConfirmation ? "/icons/ic_eye_off.svg" : "/icons/ic_eye_on.svg"} alt="비밀번호 보기" width={16} height={16} />
              </button>
            </div>
            {passwordMatchError && <p className="text-red-500 text-[12px] mt-[4px]">{passwordMatchError}</p>}
          </div>

          {signupError && <p className="text-red-500 text-[12px] mt-[4px]">{signupError}</p>}

          {/* 회원가입 버튼 */}
          <button type="submit" className="w-full h-[50px] text-[18px] font-bold rounded-md bg-[#CBD3E1] text-white hover:bg-[#6D6AFE] transition">
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
}