import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowRight, MessageSquare, Users2, Lock, Zap, Globe2, Bot } from "lucide-react";
import Image from "next/image";

export default async function RootPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/workspaces");
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="Slack Clone"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="ml-2 text-xl font-bold text-white">Slack Clone</span>
            </div>
            <a
              href="/sign-in"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign In
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-24 pb-16 sm:pt-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 tracking-tight">
              Team communication
              <span className="text-indigo-500"> reimagined</span>
            </h1>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              A modern real-time messaging platform that brings your team together. Collaborate efficiently with organized conversations, instant messaging, and powerful integrations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/sign-up"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center px-6 py-3 border border-slate-600 text-base font-medium rounded-md text-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
              >
                See Features
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-16 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Everything you need for team collaboration</h2>
            <p className="text-slate-400">Powerful features to keep your team connected and productive</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Real-time Messaging */}
            <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
              <div className="w-12 h-12 rounded-lg bg-indigo-600/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-indigo-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Real-time Messaging</h3>
              <p className="text-slate-400">Instant message delivery with typing indicators and read receipts.</p>
            </div>

            {/* Team Channels */}
            <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
              <div className="w-12 h-12 rounded-lg bg-indigo-600/10 flex items-center justify-center mb-4">
                <Users2 className="h-6 w-6 text-indigo-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Team Channels</h3>
              <p className="text-slate-400">Organize conversations by topics, projects, or teams.</p>
            </div>

            {/* Secure Communication */}
            <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
              <div className="w-12 h-12 rounded-lg bg-indigo-600/10 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-indigo-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Secure Communication</h3>
              <p className="text-slate-400">Enterprise-grade security with end-to-end encryption.</p>
            </div>

            {/* Fast Performance */}
            <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
              <div className="w-12 h-12 rounded-lg bg-indigo-600/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-indigo-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Fast Performance</h3>
              <p className="text-slate-400">Optimized for speed with instant updates and low latency.</p>
            </div>

            {/* Global Access */}
            <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
              <div className="w-12 h-12 rounded-lg bg-indigo-600/10 flex items-center justify-center mb-4">
                <Globe2 className="h-6 w-6 text-indigo-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Global Access</h3>
              <p className="text-slate-400">Access your workspace from anywhere, on any device.</p>
            </div>

            {/* AI Integration */}
            <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
              <div className="w-12 h-12 rounded-lg bg-indigo-600/10 flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-indigo-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Integration</h3>
              <p className="text-slate-400">Smart features powered by AI for enhanced productivity.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-600 rounded-2xl p-8 md:p-12 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to transform your team communication?</h2>
              <p className="text-indigo-100 mb-6 max-w-2xl">
                Join thousands of teams already using our platform to collaborate better.
              </p>
              <a
                href="/sign-up"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-800"></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-500">
            © {new Date().getFullYear()} Slack Clone. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 