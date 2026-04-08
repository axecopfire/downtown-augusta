import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EVENT_CATEGORIES, IMPACT_LEVELS } from "@/lib/constants";

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

    const events = await prisma.event.findMany({
      where: { businessId: id },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch business events:", error);
    return NextResponse.json(
      { error: "Failed to fetch business events" },
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
    if (!body.title || typeof body.title !== "string") errors.push("title is required");
    if (!body.address || typeof body.address !== "string") errors.push("address is required");
    if (body.latitude == null || typeof body.latitude !== "number") errors.push("latitude is required (number)");
    if (body.longitude == null || typeof body.longitude !== "number") errors.push("longitude is required (number)");
    if (!body.startDate || typeof body.startDate !== "string") errors.push("startDate is required (ISO string)");

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title: body.title as string,
        description: (body.description as string) ?? null,
        address: body.address as string,
        latitude: body.latitude as number,
        longitude: body.longitude as number,
        category: (body.category as string) ?? "community",
        startDate: new Date(body.startDate as string),
        endDate: body.endDate ? new Date(body.endDate as string) : null,
        startTime: (body.startTime as string) ?? null,
        endTime: (body.endTime as string) ?? null,
        impactLevel: (body.impactLevel as string) ?? "medium",
        imageUrl: (body.imageUrl as string) ?? null,
        website: (body.website as string) ?? null,
        polygon: body.polygon != null ? (body.polygon as string) : null,
        businessId: id,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Failed to create business event:", error);
    return NextResponse.json(
      { error: "Failed to create business event" },
      { status: 500 }
    );
  }
}
