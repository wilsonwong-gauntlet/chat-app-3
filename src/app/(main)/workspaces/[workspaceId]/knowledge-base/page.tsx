import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { KnowledgeBase } from "@/components/knowledge-base/knowledge-base";

export default async function KnowledgeBasePage({
  params
}: {
  params: { workspaceId: string }
}) {
  const { userId } = await auth();

  if (!userId) {
    return notFound();
  }

  const documents = await db.document.findMany({
    where: {
      workspace: {
        id: params.workspaceId,
        members: {
          some: {
            user: {
              clerkId: userId
            }
          }
        }
      }
    },
    include: {
      user: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <KnowledgeBase
      documents={documents}
      workspaceId={params.workspaceId}
    />
  );
} 