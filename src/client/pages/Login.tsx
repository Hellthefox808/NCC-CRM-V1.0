import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../../components/ui/card";
import { EnterpriseDataPlatform } from "../services/dataPlatform";
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
      const res = await EnterpriseDataPlatform.login(email, password);
      toast.success("Login Successful");
      onLoginSuccess(res.data.userType, res.data.user);
      navigate(res.data.userType === "admin" ? "/admin" : "/cadet");
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-24 bg-slate-50/50">
      <Card className="w-full max-w-md shadow-lg border-amber-200/50">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-12 h-12 bg-[#002147] rounded-full flex items-center justify-center mb-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#002147]">Officer Portal</CardTitle>
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
                <a href="#" className="text-xs text-amber-600 hover:underline">Forgot password?</a>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-[#002147] hover:bg-[#001838]" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4 bg-slate-50">
          <Button variant="ghost" size="sm" onClick={onBack}>
            Return to Homepage
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
