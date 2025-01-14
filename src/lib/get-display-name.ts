/**
 * Gets a display name for a user, handling null/undefined cases
 * For database users (members), checks user.name || email prefix
 * For Clerk users, checks OAuth username || email prefix
 */
export function getDisplayName(user: any) {
  // Handle null/undefined
  if (!user) return "Anonymous User";

  // Handle database users (from members)
  if (user.user) {
    const dbUser = user.user;
    return dbUser.name || dbUser.email?.split('@')[0] || "Anonymous User";
  }

  // Handle Clerk users
  if (user.externalAccounts?.[0]?.username || user.emailAddresses?.[0]?.emailAddress) {
    return user.externalAccounts[0]?.username || user.emailAddresses[0]?.emailAddress?.split('@')[0] || "Anonymous User";
  }

  // Handle database users (direct)
  if (user.name || user.email) {
    return user.name || user.email?.split('@')[0] || "Anonymous User";
  }

  return "Anonymous User";
} 