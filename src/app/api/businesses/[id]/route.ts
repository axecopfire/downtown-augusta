import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BUSINESS_CATEGORIES } from "@/lib/constants";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const business = await prisma.business.findUnique({ where: { id } });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error("Failed to fetch business:", error);
    return NextResponse.json(
      { error: "Failed to fetch business" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.business.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    if (body.category && !BUSINESS_CATEGORIES.includes(body.category)) {
      return NextResponse.json(
        { errors: [`Invalid category. Must be one of: ${BUSINESS_CATEGORIES.join(", ")}`] },
        { status: 400 }
      );
    }

    const business = await prisma.business.update({
      where: { id },
      data: {
        ...(body.name != null && { name: body.name.trim() }),
        ...(body.description !== undefined && {
          description: body.description?.trim() || null,
        }),
        ...(body.address != null && { address: body.address.trim() }),
        ...(body.latitude != null && { latitude: Number(body.latitude) }),
        ...(body.longitude != null && { longitude: Number(body.longitude) }),
        ...(body.category != null && { category: body.category }),
        ...(body.phone !== undefined && {
          phone: body.phone?.trim() || null,
        }),
        ...(body.website !== undefined && {
          website: body.website?.trim() || null,
        }),
        ...(body.hours !== undefined && {
          hours: body.hours?.trim() || null,
        }),
        ...(body.imageUrl !== undefined && {
          imageUrl: body.imageUrl?.trim() || null,
        }),
      },
    });

    return NextResponse.json(business);
  } catch (error) {
    console.error("Failed to update business:", error);
    return NextResponse.json(
      { error: "Failed to update business" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await prisma.business.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    await prisma.business.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete business:", error);
    return NextResponse.json(
      { error: "Failed to delete business" },
      { status: 500 }
    );
  }
}
