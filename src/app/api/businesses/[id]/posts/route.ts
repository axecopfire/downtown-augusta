import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

const VALID_PLATFORMS = ["facebook", "instagram", "twitter", "other"] as const;

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const business = await prisma.business.findUnique({ where: { id } });
    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");

    const where: Record<string, unknown> = { businessId: id };
    if (platform) {
      where.platform = platform;
    }

    const posts = await prisma.socialPost.findMany({
      where,
      orderBy: { postedAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Failed to fetch social posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch social posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const business = await prisma.business.findUnique({ where: { id } });
    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const errors: string[] = [];
    if (!body.platform || typeof body.platform !== "string") {
      errors.push("platform is required");
    } else if (!VALID_PLATFORMS.includes(body.platform as (typeof VALID_PLATFORMS)[number])) {
      errors.push(`Invalid platform. Must be one of: ${VALID_PLATFORMS.join(", ")}`);
    }
    if (!body.postedAt || typeof body.postedAt !== "string") {
      errors.push("postedAt is required (ISO string)");
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const post = await prisma.socialPost.create({
      data: {
        businessId: id,
        platform: body.platform as string,
        postedAt: new Date(body.postedAt as string),
        content: (body.content as string) ?? null,
        imageUrl: (body.imageUrl as string) ?? null,
        linkUrl: (body.linkUrl as string) ?? null,
        postId: (body.postId as string) ?? null,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Failed to create social post:", error);
    return NextResponse.json(
      { error: "Failed to create social post" },
      { status: 500 }
    );
  }
}
