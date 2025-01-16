import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { Document, User } from "@/types";
import { KnowledgeBaseClient } from "@/components/knowledge-base/knowledge-base-client";

type DocumentWithUser = Document & {
  user: User;
};

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
      workspaceId: params.workspaceId,
      workspace: {
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
  }) as DocumentWithUser[];

  return (
    <KnowledgeBaseClient
      initialDocuments={documents}
      workspaceId={params.workspaceId}
    />
  );
} 