import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string; postId: string }> };

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id, postId } = await params;

    const post = await prisma.socialPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Social post not found" },
        { status: 404 }
      );
    }

    if (post.businessId !== id) {
      return NextResponse.json(
        { error: "Social post does not belong to this business" },
        { status: 404 }
      );
    }

    await prisma.socialPost.delete({ where: { id: postId } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete social post:", error);
    return NextResponse.json(
      { error: "Failed to delete social post" },
      { status: 500 }
    );
  }
}
