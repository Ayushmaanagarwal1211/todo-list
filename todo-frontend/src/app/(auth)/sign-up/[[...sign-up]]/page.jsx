"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic'
import { useSignIn, useSignUp } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Lock, Globe } from "lucide-react";

const AuthPage = () => {
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded, setActive } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const handleOAuthLogin = useCallback(async (provider) => {
    if (!signInLoaded) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: `oauth_${provider}`,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/todo",
      });
    } catch (err) {
      setError("OAuth login failed. Try again.");
    }
  }, [signInLoaded, signIn]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!signUpLoaded) return;
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
    } catch (err) {
      setError(err.errors?.[0]?.message || "Signup failed");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!signUpLoaded) return;
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code });
      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push("/todo");
      } else {
        setError("Verification failed. Check the code and try again.");
      }
    } catch (err) {
      setError("Invalid verification code. Please try again.");
    }
  };

  if (verifying) {
    return (
      <div className="flex justify-center text-white min-h-screen items-center">
        <Card className="w-[400px] p-10 rounded-xl shadow-lg bg-neutral-900">
          <CardContent>
            <h2 className="text-xl font-bold text-center">Verify Your Email</h2>
            <p className="text-sm text-center text-gray-400 mb-4">
              Enter the verification code sent to your email
            </p>
            <form onSubmit={handleVerify} className="space-y-4">
              <Input
                type="text"
                placeholder="Verification Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-black"
                required
              />
              <Button type="submit" className="w-full bg-white text-black">
                Verify
              </Button>
            </form>
            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center text-white min-h-screen items-center">
      <Card className="w-[400px] p-10 rounded-xl shadow-lg bg-neutral-900">
        <CardContent>
          <h2 className="text-xl font-bold text-center">Create an Account</h2>
          <p className="text-sm text-center text-gray-400 mb-4">
            Enter your email below to create an account
          </p>
          <Button className="flex w-full justify-center bg-neutral-800" onClick={() => handleOAuthLogin("google")}>
            <Globe className="mr-2 h-5 w-5" /> Continue with Google
          </Button>
          <div className="text-center text-gray-400 text-xs my-4">OR</div>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 text-black"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 text-black"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-white text-black">
              Create Account
            </Button>
          </form>
          {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;