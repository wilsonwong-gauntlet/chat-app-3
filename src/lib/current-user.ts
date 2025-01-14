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

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) {
    throw new Error("User must have an email address");
  }

  // Get the best available name from Clerk
  const name = user.externalAccounts[0]?.username || email.split('@')[0];

  const dbUser = await db.user.upsert({
    where: {
      clerkId: userId
    },
    create: {
      clerkId: userId,
      email,
      name,
      imageUrl: user.imageUrl,
    },
    update: {
      email,
      name,
      imageUrl: user.imageUrl,
    }
  });

  return dbUser;
} 