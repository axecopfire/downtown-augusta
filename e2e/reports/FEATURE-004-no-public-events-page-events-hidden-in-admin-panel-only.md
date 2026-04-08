# Feature Request: No public events page — events hidden in admin panel only

| Field | Value |
|-------|-------|
| **Reporter** | Derek Sullivan (Visitor shopping for a Halloween costume) |
| **Priority** | 🔴 CRITICAL |
| **Type** | Feature Request |
| **Page** | `/admin/events` |

## Description

I'm looking for Halloween events happening this weekend in downtown Augusta. I checked the map page but there's no way to browse or search events. I couldn't find any public 'Events' page linked from the navigation. The ONLY place I found event listings is at /admin/events — which is clearly an admin page, not meant for visitors.

Events visible in admin: 10 row(s). Halloween mentioned: false. Public events link in nav: true.

A visitor should NEVER have to navigate to an admin URL to find upcoming events. This site needs a public-facing events page — ideally with date filtering ('This Weekend'), category tabs (Festival, Concert, Market), and a calendar view. I'm from out of town and specifically looking for Halloween events — there's no way for me to discover them.

## Steps to Reproduce

1. Navigate to the homepage at /
2. Look for an 'Events' link in the navigation — none found or it goes to admin
3. Navigate to /map — no event listing or event search
4. Navigate to /admin/events — find event listings here, but it's an admin page

## Expected Behavior

A public /events page accessible from the main navigation showing upcoming events with date range filtering, category filters, and search. Events should also show on the map with clear event-specific markers.

## Actual Behavior

Public events page: none found. Events only at /admin/events (10 events). Admin filters: false. Admin search: false. Halloween content found on map: false.

## User Impact

Visitors have zero visibility into upcoming events unless they stumble upon the admin panel. This defeats the entire purpose of listing events — they exist in the database but are invisible to the public. Downtown Augusta is missing out on event-driven foot traffic because visitors like me literally cannot discover what's happening. I came here specifically looking for Halloween activities and I found nothing.

## Persona Context

> **Derek Sullivan** — Derek is visiting Augusta from Atlanta for a friend's Halloween party this weekend. He needs a costume ASAP and wants to find retail shops downtown that might carry costumes, vintage clothing, or craft supplies. He's never been to downtown Augusta and is relying on this site to navigate the area quickly.
