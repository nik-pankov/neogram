"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setGoogleLoading(false); }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--tg-bg)" }}>
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4"
            style={{ background: "rgba(77,205,94,0.15)", border: "2px solid var(--tg-online)" }}>
            ✉️
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--tg-text)" }}>Check your email</h2>
          <p className="text-sm" style={{ color: "var(--tg-text-secondary)" }}>
            We sent a confirmation link to <span style={{ color: "var(--tg-accent)" }}>{email}</span>.<br />
            Click it to activate your account.
          </p>
          <Link href="/login"
            className="inline-block mt-6 px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "var(--tg-accent)", color: "#fff" }}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--tg-bg)" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-2xl"
            style={{
              background: "linear-gradient(135deg, var(--tg-accent), #3a6d9e)",
              boxShadow: "0 8px 32px rgba(82,136,193,0.35)",
            }}
          >
            ✈️
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold" style={{ color: "var(--tg-text)" }}>Create Account</h1>
            <p className="text-sm mt-1" style={{ color: "var(--tg-text-secondary)" }}>Join NeoGram today</p>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-xl" style={{ background: "var(--tg-sidebar)" }}>
          <form onSubmit={handleRegister} className="flex flex-col gap-3">
            {/* Full name */}
            <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "var(--tg-input)" }}>
              <User size={16} style={{ color: "var(--tg-text-secondary)", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: "var(--tg-text)" }}
              />
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "var(--tg-input)" }}>
              <Mail size={16} style={{ color: "var(--tg-text-secondary)", flexShrink: 0 }} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: "var(--tg-text)" }}
              />
            </div>

            {/* Password */}
            <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "var(--tg-input)" }}>
              <Lock size={16} style={{ color: "var(--tg-text-secondary)", flexShrink: 0 }} />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: "var(--tg-text)" }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ color: "var(--tg-text-secondary)" }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && <p className="text-xs px-1" style={{ color: "#ef4444" }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:brightness-110 active:scale-95 mt-1"
              style={{ background: "var(--tg-accent)", color: "#fff" }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>Create Account</span>
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-4" style={{ color: "var(--tg-text-secondary)" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-medium" style={{ color: "var(--tg-accent)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
