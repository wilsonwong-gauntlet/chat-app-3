import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { generatePresignedUrl } from "@/lib/s3";

const uploadSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1)
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { fileName, fileType } = uploadSchema.parse(body);

    const response = await generatePresignedUrl(fileType, fileName);

    return NextResponse.json(response);
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 