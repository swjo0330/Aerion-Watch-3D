"use client";

import { useState, FormEvent } from "react";
import { useAuthStore } from "@/store/authStore";

export default function LoginModal() {
  const { setToken } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // /api/backend/* → Next.js 서버 프록시 → 백엔드 (로컬/Docker 공통)
      const res = await fetch(`/api/backend/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail ?? "인증 실패");
        return;
      }
      const data = await res.json();
      setToken(data.access_token, username);
    } catch {
      setError("서버에 연결할 수 없습니다");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[20px] backdrop-saturate-[180%]">
      <div className="bg-[#1d1d1f] p-10 w-full max-w-sm rounded-[18px] shadow-apple">
        <h1 className="apple-title py-1 text-white mb-2 text-center">SkyWatch-RT</h1>
        <p className="apple-caption text-[#86868b] mb-8 text-center text-[15px]">드론 관제 시스템에 로그인하세요</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="apple-body bg-[#2a2a2d] text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-apple-blue transition-shadow placeholder:text-[#86868b]"
              placeholder="아이디 (admin)"
              autoComplete="username"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="apple-body bg-[#2a2a2d] text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-apple-blue transition-shadow placeholder:text-[#86868b]"
              placeholder="비밀번호"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="apple-caption text-red-500 text-center mt-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-apple-blue hover:bg-apple-blue-hover disabled:opacity-50 text-white apple-body rounded-full py-3.5 transition-colors"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="apple-caption text-[#aa8686] text-[13px] mt-6 text-center opacity-0 hover:opacity-100 transition-opacity">
          개발 계정: admin / admin
        </p>
      </div>
    </div>
  );
}
