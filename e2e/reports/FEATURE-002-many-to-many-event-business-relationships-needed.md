# Feature Request: Many-to-many event-business relationships needed

| Field | Value |
|-------|-------|
| **Reporter** | Carlos Rivera (Community event organizer) |
| **Priority** | 🔴 CRITICAL |
| **Type** | Feature Request |
| **Page** | `/admin/businesses/cmnq6dfhe0007josb1b39ic0x/edit` |

## Description

The current data model only allows linking an event to a single business (one-to-one via businessId on the event). The Taste of Augusta food truck rally involves 25+ food vendors, each of which is a business in the directory. Carlos needs to associate his festival with every participating restaurant, bar, and food truck so visitors can click through from the event to discover each vendor.

## Steps to Reproduce

1. Navigate to /admin/businesses/cmnq6dfhe0007josb1b39ic0x/edit
2. Click the Events tab
3. Click "Link Existing Event" — see only events that have no businessId set
4. Link one event — that event now belongs exclusively to this business
5. Visit a second business's Events tab — the same event cannot be linked again

## Expected Behavior

Events should support a many-to-many relationship with businesses through a join table. An event like a food truck rally should list all 25 participating vendors, and each vendor should show the rally on their page. Eventbrite, for example, lets organizers tag multiple venues and vendors per event.

## Actual Behavior

Each event has a single businessId field. Linking to business A automatically unlinks from business B. There is no way to associate an event with multiple businesses simultaneously.

## User Impact

This is a dealbreaker for multi-vendor events. The Taste of Augusta rally draws 10,000+ visitors and 25+ food trucks. Without many-to-many linking, visitors can't discover which businesses are participating from the event page, and businesses can't showcase the rally on their listings. This reduces cross-promotion and directly hurts vendor foot traffic.

## Persona Context

> **Carlos Rivera** — Carlos coordinates the annual 'Taste of Augusta' food truck rally and several smaller community events. He needs the admin tools to create events with accurate impact zones, set the right dates and times, and link them to participating venues. He also wants to see how his events appear on the public map.
