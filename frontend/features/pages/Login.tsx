import React, { useState } from "react";
import { useNavigate } from "@backend/lib/navigation";
import { Button } from "@frontend/components/ui/button";
import { Input } from "@frontend/components/ui/input";
import { Label } from "@frontend/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@frontend/components/ui/card";
import { EnterpriseDataPlatform } from "@backend/services/dataPlatform";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface LoginProps {
  onLoginSuccess: (type: "cadet" | "admin", user: any) => void;
  onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userType = email.includes("admin") || email.includes("ano") ? "admin" : "cadet";
      const res = await EnterpriseDataPlatform.login({ userType, email, password });
      toast.success("Login Successful");
      onLoginSuccess(res.data!.userType, res.data!.user);
      navigate(res.data!.userType === "admin" ? "/admin" : "/cadet");
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-24 bg-zinc-50/50">
      <Card className="w-full max-w-md shadow-lg border-blue-200/50">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-12 h-12 bg-[#18181B] rounded-full flex items-center justify-center mb-2">
            <ShieldCheck className="w-6 h-6 text-blue-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#18181B]">Officer Portal</CardTitle>
          <CardDescription>
            Enter your credentials to access the 19 JHR BN NCC command center.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="ano@sbu.ac.in"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-blue-700 hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#18181B] hover:bg-[#09090B]"
              disabled={isLoading}
            >
              {isLoading ? "Authenticating..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4 bg-zinc-50">
          <Button variant="ghost" size="sm" onClick={onBack}>
            Return to Homepage
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
