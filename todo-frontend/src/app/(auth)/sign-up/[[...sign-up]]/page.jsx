"use client";

import { useState, useCallback, useContext } from "react";
import { useRouter } from "next/navigation";
import { useSignIn, useSignUp ,useClerk} from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Lock, Globe } from "lucide-react";
import { Context } from "@/context/Context";
import { toast } from "react-toastify";

const AuthPage = () => {
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const {client} = useClerk()
   const router = useRouter();
  const {setLoader} = useContext(Context)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
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
      toast.error("OAuth login failed. Try again.")
    }
  }, [signInLoaded, signIn]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!signUpLoaded) return;
    setLoader(true)
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
      setLoader(false)
    } catch (err) {
      setLoader(false)
      toast.error(err.errors?.[0]?.message || "Signup failed")
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!signUpLoaded) return;
    setLoader(true)
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code });
      setLoader(false)
      if (completeSignUp.status === "complete") {
        await client.destroy()
        router.push("/sign-in");
      } else {
        toast.error("Verification failed. Check the code and try again.")
      }
    } catch (err) {
      setLoader(false)
      toast.error("Invalid verification code. Please try again.")
    }
  };

  if (verifying) {
    return (
      <div className="flex justify-center  min-h-screen ">
        <Card className="w-[400px] h-[300px] p-10 rounded-xl shadow-xl border border-gray-200 bg-white">
          <CardContent>
            <h2 className="text-2xl font-bold text-center text-gray-800">Verify Your Email</h2>
            <p className="text-sm text-center text-gray-500 mb-4">
              Enter the verification code sent to your email
            </p>
            <form onSubmit={handleVerify} className="space-y-4">
              <Input
                type="text"
                placeholder="Verification Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-gray-800"
                required
              />
              <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">
                Verify
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center  ">
      <Card className="w-[400px] h-[400px] p-10 rounded-xl shadow-xl border border-gray-200 bg-white">
        <CardContent>
          <h2 className="text-2xl font-bold text-center text-gray-800">Create an Account</h2>
          <p className="text-sm text-center text-gray-500 mb-4">
            Enter your email below to create an account
          </p>
          <Button
            className="flex cursor-pointer w-full justify-center bg-blue-100 text-blue-800 hover:bg-blue-200"
            onClick={() => handleOAuthLogin("google")}
          >
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
                className="pl-10 text-gray-800 bg-gray-100 focus:bg-white"
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
                className="pl-10 text-gray-800 bg-gray-100 focus:bg-white"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">
              Create Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
