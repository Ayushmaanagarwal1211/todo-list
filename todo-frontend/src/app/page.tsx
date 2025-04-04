import { SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center h-screen  text-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Your To-Do List</h1>
        <p className="text-gray-600 mt-2">Stay organized and track your tasks efficiently.</p>

        <div className="mt-6 flex justify-center gap-4">
          <SignedOut>
            <SignInButton>
              <Button variant="default" className="px-6 py-2 text-lg cursor-pointer">Sign In</Button>
            </SignInButton>
            <SignUpButton>
              <Button variant="outline" className="px-6 py-2 text-lg cursor-pointer">Sign Up</Button>
            </SignUpButton>
          </SignedOut>
        </div>
      </div>
    </div>
  );
}