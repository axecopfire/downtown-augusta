import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const event = await prisma.event.findUnique({ where: { id } });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(event);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};

  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.address !== undefined) data.address = body.address;
  if (body.latitude !== undefined) data.latitude = body.latitude;
  if (body.longitude !== undefined) data.longitude = body.longitude;
  if (body.category !== undefined) data.category = body.category;
  if (body.startDate !== undefined) data.startDate = new Date(body.startDate as string);
  if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate as string) : null;
  if (body.startTime !== undefined) data.startTime = body.startTime;
  if (body.endTime !== undefined) data.endTime = body.endTime;
  if (body.impactLevel !== undefined) data.impactLevel = body.impactLevel;
  if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl;
  if (body.website !== undefined) data.website = body.website;
  if (body.polygon !== undefined) data.polygon = body.polygon;
  if (body.businessId !== undefined) {
    if (body.businessId === null) {
      data.businessId = null;
    } else {
      const business = await prisma.business.findUnique({ where: { id: body.businessId as string } });
      if (!business) {
        return NextResponse.json({ error: "Business not found" }, { status: 404 });
      }
      data.businessId = body.businessId;
    }
  }

  try {
    const updated = await prisma.event.update({ where: { id }, data });

    // Sync EventBusiness join record when businessId changes
    if (body.businessId !== undefined) {
      if (body.businessId === null && existing.businessId) {
        await prisma.eventBusiness.deleteMany({
          where: { eventId: id, businessId: existing.businessId },
        });
      } else if (body.businessId) {
        await prisma.eventBusiness.upsert({
          where: {
            eventId_businessId: {
              eventId: id,
              businessId: body.businessId as string,
            },
          },
          create: { eventId: id, businessId: body.businessId as string },
          update: {},
        });
      }
    }

    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  try {
    await prisma.event.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
