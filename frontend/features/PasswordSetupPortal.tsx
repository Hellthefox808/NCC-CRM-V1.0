import React, { useState, useEffect } from "react";
import { Check, ShieldCheck, Eye, EyeOff, Lock, User, AlertCircle, ArrowRight } from "lucide-react";

interface PasswordSetupPortalProps {
  token: string;
  mode?: "activation" | "reset";
}

interface UserData {
  username: string;
  userType?: string;
  email?: string;
  fullName?: string;
}

export function PasswordSetupPortal({ token, mode = "activation" }: PasswordSetupPortalProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  // Validate token on component mount
  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setError("Activation token is missing from the request URL.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/v1/auth/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setUserData(data.data);
        } else {
          setError(data.error || "This activation link is invalid or has expired.");
        }
      } catch (err) {
        setError("Failed to verify activation link. Please check your connection.");
      } finally {
        setLoading(false);
      }
    }
    verifyToken();
  }, [token]);

  // Password Policy Checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const passedChecksCount = [
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
  ].filter(Boolean).length;

  // Strength score out of 100
  const strengthPercentage = (passedChecksCount / 5) * 100;

  const getStrengthText = () => {
    if (passedChecksCount <= 2) return { label: "Weak", color: "bg-red-500", text: "text-red-600" };
    if (passedChecksCount <= 4) return { label: "Medium", color: "bg-amber-500", text: "text-amber-600" };
    return { label: "Strong", color: "bg-emerald-600", text: "text-emerald-600" };
  };

  const strength = getStrengthText();
  const isValidForm = passedChecksCount === 5 && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidForm) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to set password. Please try again.");
      }
    } catch (err) {
      setError("Network error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-300 font-medium">Verifying NCC Activation Link...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Account Activated</h2>
            <p className="text-slate-400 text-sm">
              Your NCC account has been successfully configured. You can now sign in using your NCC username and new password.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-amber-500/20 rounded-lg p-4 text-xs text-amber-300/90 text-left space-y-1">
            <p className="font-semibold text-amber-400">OWASP Security Policy:</p>
            <p className="text-slate-400">
              For your security, you were not automatically signed in. Please navigate to the portal login page to authenticate.
            </p>
          </div>

          <a
            href="/login"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-all shadow-lg hover:shadow-amber-500/20"
          >
            <span>Go to NCC Login</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      {/* Container */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header Banner */}
        <div className="bg-slate-950 border-b border-slate-800 p-6 text-center space-y-2 relative">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
          <div className="inline-flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span>19 Jharkhand Bn NCC</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {mode === "reset" ? "Reset Your NCC Password" : "Set Your NCC Password"}
          </h1>
          <p className="text-xs text-slate-400">
            Create a secure password for your Sarala Birla University Sub-Unit NCC Portal account.
          </p>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-950/50 border border-red-800 text-red-300 p-3 rounded-lg text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Readonly */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Username / Identifier
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  readOnly
                  value={userData?.username || "NCCXXXXXXXX"}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-9 pr-3 text-sm text-slate-300 font-mono font-bold cursor-not-allowed select-all"
                />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure password"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg py-2.5 pl-9 pr-10 text-sm text-white transition-all placeholder:text-slate-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg py-2.5 pl-9 pr-10 text-sm text-white transition-all placeholder:text-slate-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-[11px] text-red-400 mt-1">Passwords do not match.</p>
              )}
            </div>

            {/* Strength Meter */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Password strength</span>
                <span className={`font-bold ${strength.text}`}>{password ? strength.label : "—"}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full ${strength.color} transition-all duration-300`}
                  style={{ width: `${password ? strengthPercentage : 0}%` }}
                />
              </div>

              {/* Requirement checklist */}
              <div className="grid grid-cols-1 gap-1.5 pt-2 text-xs">
                <div className={`flex items-center gap-2 ${hasMinLength ? "text-emerald-400 font-medium" : "text-slate-500"}`}>
                  <Check className={`w-3.5 h-3.5 ${hasMinLength ? "opacity-100" : "opacity-30"}`} />
                  <span>Minimum 8 characters long</span>
                </div>
                <div className={`flex items-center gap-2 ${hasUppercase ? "text-emerald-400 font-medium" : "text-slate-500"}`}>
                  <Check className={`w-3.5 h-3.5 ${hasUppercase ? "opacity-100" : "opacity-30"}`} />
                  <span>At least one uppercase character (A-Z)</span>
                </div>
                <div className={`flex items-center gap-2 ${hasLowercase ? "text-emerald-400 font-medium" : "text-slate-500"}`}>
                  <Check className={`w-3.5 h-3.5 ${hasLowercase ? "opacity-100" : "opacity-30"}`} />
                  <span>At least one lowercase character (a-z)</span>
                </div>
                <div className={`flex items-center gap-2 ${hasNumber ? "text-emerald-400 font-medium" : "text-slate-500"}`}>
                  <Check className={`w-3.5 h-3.5 ${hasNumber ? "opacity-100" : "opacity-30"}`} />
                  <span>At least one number (0-9)</span>
                </div>
                <div className={`flex items-center gap-2 ${hasSpecialChar ? "text-emerald-400 font-medium" : "text-slate-500"}`}>
                  <Check className={`w-3.5 h-3.5 ${hasSpecialChar ? "opacity-100" : "opacity-30"}`} />
                  <span>At least one special character (!@#$%...)</span>
                </div>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={!isValidForm || submitting}
              className="w-full mt-4 py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold rounded-lg transition-all shadow-lg hover:shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Activating Account...</span>
                </>
              ) : (
                <span>{mode === "reset" ? "Update Password" : "Activate Account"}</span>
              )}
            </button>
          </form>

          <p className="text-[11px] text-center text-slate-500">
            Your password is encrypted and stored using salted scrypt standard.
          </p>
        </div>
      </div>
    </div>
  );
}
