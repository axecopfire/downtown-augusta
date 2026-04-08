import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EVENT_CATEGORIES, IMPACT_LEVELS } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const upcoming = searchParams.get("upcoming");
  const impact = searchParams.get("impact");

  const where: Record<string, unknown> = {};

  if (category && EVENT_CATEGORIES.includes(category as (typeof EVENT_CATEGORIES)[number])) {
    where.category = category;
  }

  if (upcoming === "true") {
    where.startDate = { gte: new Date() };
  }

  if (impact && IMPACT_LEVELS.includes(impact as (typeof IMPACT_LEVELS)[number])) {
    where.impactLevel = impact;
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: { startDate: "asc" },
  });

  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
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

  try {
    // If businessId provided, verify the business exists
    if (body.businessId != null) {
      if (typeof body.businessId !== "string") {
        return NextResponse.json({ error: "businessId must be a string" }, { status: 400 });
      }
      const business = await prisma.business.findUnique({ where: { id: body.businessId as string } });
      if (!business) {
        return NextResponse.json({ error: "Business not found" }, { status: 404 });
      }
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
        businessId: (body.businessId as string) ?? null,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
