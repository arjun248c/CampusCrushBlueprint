import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface LoginFormProps {
  onSuccess?: () => void;
  collegeId?: string;
  registrationOnly?: boolean;
  onNeedAccount?: () => void;
}

export function LoginForm({ onSuccess, collegeId, registrationOnly = false, onNeedAccount }: LoginFormProps) {
  const [isLogin, setIsLogin] = useState(!registrationOnly);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Login failed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onSuccess?.();
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { email: string; firstName: string; lastName?: string }) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, collegeId }),
      });
      if (!response.ok) throw new Error("Registration failed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onSuccess?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      loginMutation.mutate({ email, password });
    } else {
      registerMutation.mutate({ email, firstName, lastName });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isLogin ? "Login" : "Sign Up"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {isLogin ? (
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          ) : (
            <>
              <Input
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </>
          )}
          <Button 
            type="submit" 
            className="w-full"
            disabled={loginMutation.isPending || registerMutation.isPending}
          >
            {isLogin ? "Login" : "Sign Up"}
          </Button>
          {!registrationOnly && (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                if (isLogin && onNeedAccount) {
                  onNeedAccount();
                } else {
                  setIsLogin(!isLogin);
                }
              }}
            >
              {isLogin ? "Need an account? Sign up" : "Have an account? Login"}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}