import { clerkMiddleware } from '@clerk/nextjs/server'

// Only run middleware on matched routes
export default clerkMiddleware()

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
}