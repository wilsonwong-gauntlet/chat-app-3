import { SignInButton } from "@clerk/nextjs";

export default function RootPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="max-w-2xl mx-auto text-center px-4">
        <h1 className="text-4xl font-bold mb-4">Welcome to Slack Clone</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
          A modern real-time messaging platform
        </p>
        <SignInButton mode="modal">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            Get Started
          </button>
        </SignInButton>
      </div>
    </div>
  );
} 