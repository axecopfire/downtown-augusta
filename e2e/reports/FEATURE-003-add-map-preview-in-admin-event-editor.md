# Feature Request: Add map preview in admin event editor

| Field | Value |
|-------|-------|
| **Reporter** | Carlos Rivera (Community event organizer) |
| **Priority** | 🟠 HIGH |
| **Type** | Feature Request |
| **Page** | `/map` |

## Description

After creating or editing an event in the admin panel, there is no way to preview how it will appear on the public map. Carlos has to save the event, navigate manually to /map, find his event marker, and click it to verify the popup looks correct. For a multi-day festival with polygon impact zones, this round-trip wastes time and risks publishing inaccurate event data visible to thousands of visitors.

## Steps to Reproduce

1. Create or edit an event at /admin/events/new or /admin/events/[id]/edit
2. Fill in all fields including impact level and polygon area
3. Click "Create Event" or "Update Event"
4. Get redirected to /admin/events list — no visual preview shown
5. Manually navigate to /map to check the event marker, polygon, and popup
6. If something looks wrong, go back to admin to edit and repeat

## Expected Behavior

The admin event form should include a live map preview panel showing the marker (with correct impact color), the polygon overlay, and a sample popup. A 'Preview on Map' button could open the public map centered on the event. This is standard in map-based CMS tools like Mapbox Studio or Google My Maps.

## Actual Behavior

No preview at all. The polygon drawer shows the shape being drawn, but does not preview the final marker color, popup content, or how the polygon will render on the actual map.

## User Impact

For the Taste of Augusta rally, Carlos defines a large polygon impact zone across several blocks. Without preview, he published an incorrectly shaped zone that confused attendees about road closures. Each edit-save-check cycle takes 2+ minutes, and when configuring 13 events with polygons, this adds up to hours of wasted time.

## Persona Context

> **Carlos Rivera** — Carlos coordinates the annual 'Taste of Augusta' food truck rally and several smaller community events. He needs the admin tools to create events with accurate impact zones, set the right dates and times, and link them to participating venues. He also wants to see how his events appear on the public map.
