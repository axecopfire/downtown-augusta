# Feature Request: Admin events table needs sorting and filtering

| Field | Value |
|-------|-------|
| **Reporter** | Carlos Rivera (Community event organizer) |
| **Priority** | 🟠 HIGH |
| **Type** | Feature Request |
| **Page** | `/admin/events` |

## Description

The admin events table at /admin/events displays all events in a flat list with no ability to sort by date, category, or impact level, and no way to search or filter. Carlos manages dozens of events per year — from weekly food truck nights to the annual Taste of Augusta rally — and scrolling through an unsorted list to find a specific event is painfully slow.

## Steps to Reproduce

1. Navigate to /admin/events
2. Observe the events table with columns: Event, Date, Category, Impact, Actions
3. Found 0 sortable column headers and 0 filter controls
4. Try to find a specific event by name — must visually scan the entire list

## Expected Behavior

Column headers should be clickable to sort ascending/descending. A search bar should allow filtering by event title. Category and impact dropdowns should narrow results. Platforms like Eventbrite let organizers search, sort, and filter events instantly.

## Actual Behavior

No sorting, searching, or filtering capabilities. All events displayed in a static list.

## User Impact

As an organizer running 30+ events per year, Carlos wastes significant time hunting for events to edit. During crunch time before a major festival, every minute spent searching the admin table is a minute not spent coordinating vendors or updating event details that directly affect downtown foot traffic.

## Persona Context

> **Carlos Rivera** — Carlos coordinates the annual 'Taste of Augusta' food truck rally and several smaller community events. He needs the admin tools to create events with accurate impact zones, set the right dates and times, and link them to participating venues. He also wants to see how his events appear on the public map.
