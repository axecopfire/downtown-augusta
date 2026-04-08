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

  const updated = await prisma.event.update({ where: { id }, data });

  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  await prisma.event.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}
