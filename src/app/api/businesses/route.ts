import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BUSINESS_CATEGORIES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where = category ? { category } : {};

    const businesses = await prisma.business.findMany({
      where,
      orderBy: { name: "asc" },
      include: { _count: { select: { events: true, socialPosts: true } } },
    });

    return NextResponse.json(businesses);
  } catch (error) {
    console.error("Failed to fetch businesses:", error);
    return NextResponse.json(
      { error: "Failed to fetch businesses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const errors: string[] = [];
    if (!body.name?.trim()) errors.push("Name is required");
    if (!body.address?.trim()) errors.push("Address is required");
    if (body.latitude == null || isNaN(Number(body.latitude)))
      errors.push("Valid latitude is required");
    if (body.longitude == null || isNaN(Number(body.longitude)))
      errors.push("Valid longitude is required");
    if (body.category && !BUSINESS_CATEGORIES.includes(body.category)) {
      errors.push(`Invalid category. Must be one of: ${BUSINESS_CATEGORIES.join(", ")}`);
    }

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const business = await prisma.business.create({
      data: {
        name: body.name.trim(),
        description: body.description?.trim() || null,
        address: body.address.trim(),
        latitude: Number(body.latitude),
        longitude: Number(body.longitude),
        category: body.category || "general",
        phone: body.phone?.trim() || null,
        website: body.website?.trim() || null,
        hours: body.hours?.trim() || null,
        imageUrl: body.imageUrl?.trim() || null,
      },
    });

    return NextResponse.json(business, { status: 201 });
  } catch (error) {
    console.error("Failed to create business:", error);
    return NextResponse.json(
      { error: "Failed to create business" },
      { status: 500 }
    );
  }
}
