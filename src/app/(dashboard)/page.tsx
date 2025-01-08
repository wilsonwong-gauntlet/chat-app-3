import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MessageInput } from "@/components/message-input";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <header className="h-14 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">#general</h1>
          <span className="text-sm text-gray-500">3 members</span>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {/* Placeholder messages */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">John Doe</span>
                <span className="text-xs text-gray-500">12:34 PM</span>
              </div>
              <p className="text-gray-900 dark:text-gray-100">
                Hello everyone! Welcome to the general channel.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Message Input */}
      <MessageInput 
        onSend={(message) => {
          // TODO: Implement message sending
          console.log("Sending message:", message);
        }}
      />
    </div>
  );
} 