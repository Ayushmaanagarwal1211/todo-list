"use client";

import { useReducer, useCallback, useContext } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/clerk-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Lock, Globe } from "lucide-react";
import { Context } from "@/context/LoaderContext"; 
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

const initialState = {
  email: "",
  password: "",
  error: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return initialState;
    default:
      return state;
  }
};

const AuthPage = () => {
  const { signIn, isLoaded: signInLoaded, setActive } = useSignIn();
  const { setLoader } = useContext(Context);
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { email, password } = state;

  const handleOAuthLogin = useCallback(
    async (provider) => {
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
    },
    [signInLoaded, signIn]
  );

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!signInLoaded) return;
    setLoader(true)
    try {
      const result = await signIn.create({ identifier: email, password });
      await setActive({ session: result.createdSessionId });
      toast.success("Login Successful")
      router.push("/todo");
    } catch (err) {
      setLoader(false)
      toast.error("Authentication failed. Check your credentials.")
    }
  };

  return (
    <div className="flex justify-center  ">
      <Card className="w-[400px] h-[400px] p-8 rounded-2xl shadow-2xl bg-white">
        <CardContent>
          <h2 className="text-2xl font-semibold text-center text-gray-800">Login</h2>
          <p className="text-sm text-center text-gray-500 mb-5">
            Enter your email below to log into your account
          </p>

          <Button
            className="flex cursor-pointer w-full justify-center bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
            onClick={() => handleOAuthLogin("google")}
          >
            <Globe className="mr-2 h-5 w-5" /> Continue with Google
          </Button>

          <div className="text-center text-gray-400 text-xs my-4">OR</div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "email", value: e.target.value })}
                className="pl-10 bg-gray-100 text-gray-800 border border-gray-300 focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "password", value: e.target.value })}
                className="pl-10 bg-gray-100 text-gray-800 border border-gray-300 focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
            >
           Sign In
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
