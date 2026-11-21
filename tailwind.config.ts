import type { Config } from "tailwindcss";

// 화면 전체가 같은 색·글꼴을 쓰도록 디자인 토큰을 한곳에 모은다.
// 종이 같은 바탕(paper) 위에 잉크색 글자, 강조는 brand 하나만 쓴다.
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F5F7FA",
        surface: "#FFFFFF",
        ink: "#1F2430",
        sub: "#5E6673",
        faint: "#9AA3AF",
        line: "#E3E8EF",
        brand: { DEFAULT: "#3D4FD8", soft: "#EEF0FD", dark: "#2E3CAF" },
        red: "#E5484D",
        // 예전 화면이 쓰던 회색 단계 (호환용)
        black: "#111322",
        gray: {
          500: "#3e3e43",
          400: "#9fa6b2",
          300: "#ccd5e3",
          200: "#e7effb",
          100: "#f0f6ff",
        },
      },
      fontFamily: {
        sans: ["Pretendard Variable", "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", "sans-serif"],
        serif: ["var(--font-serif)", "AppleMyungjo", "Batang", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(31,36,48,0.04), 0 4px 16px rgba(31,36,48,0.06)",
      },
      screens: {
        xs: "390px",
      },
    },
  },
  plugins: [],
} satisfies Config;
