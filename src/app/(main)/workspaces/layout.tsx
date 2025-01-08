import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";

interface WorkspacesLayoutProps {
  children: React.ReactNode;
}

export default function WorkspacesLayout({
  children,
}: WorkspacesLayoutProps) {
  return children;
} 