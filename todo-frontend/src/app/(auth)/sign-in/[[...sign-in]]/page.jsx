"use client";

import dynamic from "next/dynamic";
import { useReducer, useCallback, useContext } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/clerk-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Lock, Globe } from "lucide-react";
import { Context } from "@/context/LoaderContext"; 
import { Button } from "@/components/ui/button";

const initialState = {
  email: "",
  password: "",
  error: null,
  loading: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
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
  const { email, password, error, loading } = state;

  // Handle OAuth login
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
        dispatch({ type: "SET_ERROR", error: "OAuth login failed. Try again." });
      }
    },
    [signInLoaded, signIn]
  );

  // Handle email/password authentication
  const handleAuth = async (e) => {
    e.preventDefault();
    if (!signInLoaded) return;

    dispatch({ type: "SET_LOADING", loading: true });

    try {
      const result = await signIn.create({ identifier: email, password });
      await setActive({ session: result.createdSessionId });

      setLoader(true);
      router.push("/todo");
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: "Authentication failed. Check your credentials." });
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  };

  return (
    <div className="flex justify-center text-white min-h-screen items-center">
      <Card className="w-[400px] p-10 rounded-xl shadow-lg bg-neutral-900">
        <CardContent>
          <h2 className="text-xl font-bold text-center">Login</h2>
          <p className="text-sm text-center text-gray-400 mb-4">
            Enter your email below to log into your account
          </p>

          {/* OAuth Login Button */}
          <Button
            className="flex w-full justify-center bg-neutral-800 hover:bg-neutral-700 transition"
            onClick={() => handleOAuthLogin("google")}
          >
            <Globe className="mr-2 h-5 w-5" /> Continue with Google
          </Button>

          <div className="text-center text-gray-400 text-xs my-4">OR</div>

          {/* Email/Password Login Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "email", value: e.target.value })}
                className="pl-10 bg-neutral-800 border-none text-white focus:ring-2 focus:ring-blue-500"
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
                className="pl-10 bg-neutral-800 border-none text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <Button type="submit" className="w-full bg-white text-black font-medium" disabled={loading}>
              {loading ? "Processing..." : "Sign In"}
            </Button>
          </form>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
