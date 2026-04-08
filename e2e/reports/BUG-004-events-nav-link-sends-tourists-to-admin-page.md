# Bug Report: Events nav link sends tourists to admin page

| Field | Value |
|-------|-------|
| **Reporter** | Priya Nair (First-time weekend tourist) |
| **Priority** | 🔴 CRITICAL |
| **Type** | Bug Report |
| **Page** | `http://localhost:3000/` |

## Description

I clicked the 'Events' link in the navigation expecting to see a public-facing events page — something like an event calendar or listing with dates, descriptions, and photos. Instead, I landed on `/admin/events` which is clearly an administrative interface with a data table (0 events), no visible admin actions. This is a significant UX problem — tourists should never encounter admin interfaces. It's confusing and makes the site feel unfinished.

## Steps to Reproduce

1. Go to the homepage at /
2. Click the 'Events' link in the top navigation bar
3. Observe that the URL changes to /admin/events
4. See an admin table with Edit and Delete controls
5. Wonder whether you accidentally broke something

## Expected Behavior

The 'Events' nav link should go to a public `/events` page showing a beautiful, browsable event listing or calendar view. Events should be filterable by date ('This Weekend', 'Next Week') and category, with photos, descriptions, and 'Add to Calendar' buttons.

## Actual Behavior

No public events page found. Events link exists: true, navigated to admin: false, current URL: http://localhost:3000/

## User Impact

This is a trust-killer for tourists. Seeing an admin page makes me question whether this site is even meant for the public. I'd immediately leave. Every tourism site I've used — Visit Savannah, Explore Charleston — has a gorgeous public events page. This is Augusta's biggest gap right now.

## Persona Context

> **Priya Nair** — Priya is a travel blogger from Savannah spending a long weekend in Augusta. She wants to experience the best of downtown — great food, live music, and local culture. She's planning her itinerary and hopes this site will help her discover what's happening and where to eat.
