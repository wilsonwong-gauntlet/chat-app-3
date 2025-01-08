import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

console.log("[UPLOADTHING_ROUTE] Initializing route handler...");
 
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
}); 