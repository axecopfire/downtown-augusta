# Feature Request: Event duplication and template system

| Field | Value |
|-------|-------|
| **Reporter** | Carlos Rivera (Community event organizer) |
| **Priority** | 🟡 MEDIUM |
| **Type** | Feature Request |
| **Page** | `/admin/events/cmnq6dfhn000ijosbcfjycb6q/edit` |

## Description

There is no way to duplicate an existing event or save one as a template. Carlos runs the Taste of Augusta rally every year with the same venue, polygon impact zone, description, and category — only dates and minor details change. Without duplication, he recreates the entire event from scratch annually, including re-drawing the polygon impact area point by point on the map.

## Steps to Reproduce

1. Navigate to /admin/events/cmnq6dfhn000ijosbcfjycb6q/edit — the existing "Food Truck Rally" event
2. Look for "Duplicate", "Copy", "Clone", or "Use as Template" buttons — none found
3. Navigate to /admin/events — look for bulk actions or row-level duplicate — none found
4. Found 0 duplicate/copy/bulk-action controls on the list page
5. Only option: manually create a new event and re-enter all fields

## Expected Behavior

A "Duplicate" button on the event edit page should create a new event pre-filled with all the original's data (title appended with '(Copy)', dates cleared for re-entry). An event template library would let Carlos save reusable configurations. Google Calendar's 'Duplicate' and Eventbrite's 'Copy Event' features do exactly this.

## Actual Behavior

No duplication, cloning, or template functionality exists. Each event must be built entirely from scratch.

## User Impact

The Taste of Augusta rally has a complex polygon impact zone spanning 6 city blocks. Re-drawing this polygon every year is tedious and error-prone — last year Carlos placed a vertex on the wrong block, causing the impact zone to show incorrect road closures on the public map for a week before anyone noticed. A duplicate button would preserve the exact polygon geometry. Across all his events, duplication would save Carlos roughly 5 hours per year of repetitive data entry.

## Persona Context

> **Carlos Rivera** — Carlos coordinates the annual 'Taste of Augusta' food truck rally and several smaller community events. He needs the admin tools to create events with accurate impact zones, set the right dates and times, and link them to participating venues. He also wants to see how his events appear on the public map.
