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

  const dbUser = await db.user.upsert({
    where: {
      clerkId: userId
    },
    create: {
      clerkId: userId,
      email: user.emailAddresses[0]?.emailAddress || "",
      name: `${user.firstName} ${user.lastName}`.trim() || user.username || "User",
      imageUrl: user.imageUrl,
    },
    update: {
      email: user.emailAddresses[0]?.emailAddress || "",
      name: `${user.firstName} ${user.lastName}`.trim() || user.username || "User",
      imageUrl: user.imageUrl,
    }
  });

  return dbUser;
} 