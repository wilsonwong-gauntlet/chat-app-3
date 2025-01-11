import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowRight, MessageSquare, Users2, Lock, Zap, Globe2, Bot, BarChart2, GitMerge } from "lucide-react";
import Image from "next/image";

export default async function RootPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/workspaces");
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">

              <span className="ml-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">Clarity AI</span>
            </div>
            <a
              href="/sign-in"
              className="inline-flex items-center px-4 py-2 border border-zinc-200 dark:border-zinc-700 text-sm font-medium rounded-md text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500"
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
            <h1 className="text-4xl sm:text-6xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 tracking-tight">
              Intelligent conversations.
              <span className="text-zinc-500"> Structured clarity.</span>
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
              An AI-enhanced chat platform designed for precise communication and systematic knowledge management. Built for those who value clear thinking and efficient collaboration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/sign-up"
                className="inline-flex items-center px-6 py-3 border border-zinc-200 dark:border-zinc-700 text-base font-medium rounded-md text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500"
              >
                Begin
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center px-6 py-3 border border-zinc-200 dark:border-zinc-700 text-base font-medium rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500"
              >
                View Features
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-16 bg-white dark:bg-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Core Architecture</h2>
            <p className="text-zinc-600 dark:text-zinc-400">Essential components for intelligent communication</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Knowledge Foundation */}
            <div className="p-6 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
              <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                <BarChart2 className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Message Architecture</h3>
              <p className="text-zinc-600 dark:text-zinc-400">Structured conversations with context-aware organization and intelligent threading.</p>
            </div>

            {/* Thought Synthesis */}
            <div className="p-6 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
              <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                <GitMerge className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">AI Integration</h3>
              <p className="text-zinc-600 dark:text-zinc-400">Context-aware AI assistance that enhances understanding without disrupting flow.</p>
            </div>

            {/* Mental Sanctuary */}
            <div className="p-6 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
              <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Privacy Control</h3>
              <p className="text-zinc-600 dark:text-zinc-400">Granular privacy settings with encrypted communications and selective sharing.</p>
            </div>

            {/* Cognitive Flow */}
            <div className="p-6 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
              <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Information Flow</h3>
              <p className="text-zinc-600 dark:text-zinc-400">Efficient message handling with minimal latency and intelligent prioritization.</p>
            </div>

            {/* Collective Intelligence */}
            <div className="p-6 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
              <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                <Globe2 className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Knowledge Network</h3>
              <p className="text-zinc-600 dark:text-zinc-400">Systematic organization of discussions with advanced search and filtering.</p>
            </div>

            {/* Augmented Wisdom */}
            <div className="p-6 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
              <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-zinc-900 dark:text-zinc-100" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Pattern Recognition</h3>
              <p className="text-zinc-600 dark:text-zinc-400">AI-powered insights that identify patterns and connections in conversations.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-8 md:p-12 border border-zinc-200 dark:border-zinc-700">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Experience structured communication</h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl">
                Join teams using AI-enhanced chat to achieve clearer communication and better outcomes.
              </p>
              <a
                href="/sign-up"
                className="inline-flex items-center px-6 py-3 border border-zinc-200 dark:border-zinc-700 text-base font-medium rounded-md text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            © {new Date().getFullYear()} Clarity AI Chat. Version 1.0.4
          </p>
        </div>
      </footer>
    </div>
  );
} 