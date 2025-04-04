"use client";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";

const SSOCallback = () => {


  return (
    <div className="flex h-screen flex-col items-center ">
      <AuthenticateWithRedirectCallback />
      
      <div className="bg-white flex flex-col items-center shadow-md p-8 rounded-lg text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>

        <h2 className="mt-4 text-2xl font-semibold text-gray-800">
          Authenticating Your Account...
        </h2>
        <p className="mt-2 text-gray-600">
          Please wait while we verify your credentials and log you in.
        </p>

        <p className="mt-4 text-sm text-gray-500">
          Redirecting you to your Todo List App  shortly... 🚀
        </p>
      </div>
    </div>
  );
};

export default SSOCallback;
