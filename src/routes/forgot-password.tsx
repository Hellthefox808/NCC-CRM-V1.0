import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { ShieldCheck, Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — 19 JHR BN NCC" },
      {
        name: "description",
        content: "Recover your 19 Jharkhand Battalion NCC portal account access.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordRoute,
});

function ForgotPasswordRoute() {
  const [identifier, setIdentifier] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      const data = await res.json();
      setMessage(
        data.message ||
          "If an account matches the information provided, recovery instructions will be sent to your registered email address.",
      );
      setSubmitted(true);
    } catch (err) {
      setError("Failed to send recovery request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 p-6 text-center space-y-2 relative">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
          <div className="inline-flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span>19 Jharkhand Bn NCC</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Account Recovery</h1>
          <p className="text-xs text-slate-400">
            Enter your registered username, SBU Roll No, or official email address to receive password reset instructions.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {submitted ? (
            <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-14 h-14 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-white">Recovery Instructions Sent</h2>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 border border-slate-800 p-4 rounded-lg">
                  {message}
                </p>
              </div>
              <p className="text-[11px] text-slate-500">
                For security reasons, this response is displayed regardless of whether the account is registered.
              </p>
              <a
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Login</span>
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-950/50 border border-red-800 text-red-300 p-3 rounded-lg text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Registered Identifier or Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Username, SBU Roll No, or Email"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-600 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!identifier.trim() || submitting}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold rounded-lg transition-all shadow-lg hover:shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Processing Request...</span>
                  </>
                ) : (
                  <span>Send Recovery Email</span>
                )}
              </button>

              <div className="pt-2 text-center">
                <a
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Portal Login</span>
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
