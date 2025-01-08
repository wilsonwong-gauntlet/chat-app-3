import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";

export const currentProfile = async () => {
  const authResult = await auth();
  const userId = authResult.userId;

  if (!userId) {
    return null;
  }

  const profile = await db.user.findUnique({
    where: {
      clerkId: userId,
    }
  });

  return profile;
} 