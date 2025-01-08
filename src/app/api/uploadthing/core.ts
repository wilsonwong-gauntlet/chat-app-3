import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
 
const f = createUploadthing();

console.log("[UPLOADTHING_CONFIG] Initializing...");
 
const handleAuth = async () => {
  try {
    console.log("[UPLOADTHING_AUTH] Starting auth check...");
    const authResult = await auth();
    console.log("[UPLOADTHING_AUTH] Auth result:", authResult);
    const userId = authResult.userId;
    
    if (!userId) {
      console.error("[UPLOADTHING_AUTH] No userId found");
      throw new Error("Unauthorized");
    }
    console.log("[UPLOADTHING_AUTH] Authorized with userId:", userId);
    return { userId };
  } catch (error) {
    console.error("[UPLOADTHING_AUTH] Auth error:", error);
    throw error;
  }
}
 
export const ourFileRouter = {
  workspaceImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      try {
        console.log("[UPLOADTHING_MIDDLEWARE] Starting workspace image upload...");
        const { userId } = await handleAuth();
        console.log("[UPLOADTHING_MIDDLEWARE] Auth successful, proceeding with upload");
        return { userId };
      } catch (error) {
        console.error("[UPLOADTHING_MIDDLEWARE] Workspace image error:", error);
        throw error;
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("[UPLOAD_COMPLETE] Workspace image:", { metadata, file });
      const fileUrl = `https://utfs.io/f/${file.key}`;
      return { fileUrl };
    }),
  messageFile: f(["image", "pdf"])
    .middleware(async () => {
      try {
        console.log("[UPLOADTHING_MIDDLEWARE] Starting message file upload...");
        const { userId } = await handleAuth();
        console.log("[UPLOADTHING_MIDDLEWARE] Auth successful, proceeding with upload");
        return { userId };
      } catch (error) {
        console.error("[UPLOADTHING_MIDDLEWARE] Message file error:", error);
        throw error;
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("[UPLOAD_COMPLETE] Message file:", { metadata, file });
      const fileUrl = `https://utfs.io/f/${file.key}`;
      return { fileUrl };
    })
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter; 