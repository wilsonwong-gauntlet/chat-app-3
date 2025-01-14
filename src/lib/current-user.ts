import { auth, currentUser } from "@clerk/nextjs/server";

import { db } from "@/lib/db";

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();

  if (!user) {
    return null;
  }

  // Log when GitHub users don't have first/last names
  if (!user.firstName && !user.lastName && user.username) {
    console.log("[getCurrentUser] GitHub user missing name:", {
      username: user.username,
      provider: user.externalAccounts[0]?.provider
    });
  }

  const dbUser = await db.user.upsert({
    where: {
      clerkId: userId
    },
    create: {
      clerkId: userId,
      email: user.emailAddresses[0]?.emailAddress || "",
      name: `${user.firstName} ${user.lastName}`.trim() || `@${user.username}` || "Anonymous User",
      imageUrl: user.imageUrl,
    },
    update: {
      email: user.emailAddresses[0]?.emailAddress || "",
      name: `${user.firstName} ${user.lastName}`.trim() || `@${user.username}` || "Anonymous User",
      imageUrl: user.imageUrl,
    }
  });

  return dbUser;
} 