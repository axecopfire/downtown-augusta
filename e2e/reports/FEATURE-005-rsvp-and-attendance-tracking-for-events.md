# Feature Request: RSVP and attendance tracking for events

| Field | Value |
|-------|-------|
| **Reporter** | Carlos Rivera (Community event organizer) |
| **Priority** | 🟠 HIGH |
| **Type** | Feature Request |
| **Page** | `/admin/events/cmnq6kpsp0000qbsbxcyywn2n/edit` |

## Description

There are no RSVP, registration, or attendance tracking features anywhere in the app. Carlos needs to estimate how many people will attend the Taste of Augusta rally to plan vendor booth layouts, order portable restrooms, coordinate with city services for road closures, and give food trucks foot traffic projections so they can stock appropriately.

## Steps to Reproduce

1. Navigate to /admin/events/cmnq6kpsp0000qbsbxcyywn2n/edit
2. Look for RSVP, capacity, attendance, or registration fields — none exist
3. Navigate to /map and click an event marker
4. Look for RSVP or registration buttons in the popup — none exist
5. Check the event API response for attendance-related fields — none exist

## Expected Behavior

Each event should have a capacity field (optional) and an RSVP/registration mechanism. The admin dashboard should show RSVP counts and trends. Public event pages or popups should let visitors indicate interest ('Going', 'Interested'). An export option for attendee lists would help logistics planning. Eventbrite, Meetup, and Facebook Events all provide this as core functionality.

## Actual Behavior

Zero attendance-related features. The event model only stores descriptive info (title, date, location, impact). No way to gauge interest or track turnout.

## User Impact

Without RSVP data, Carlos is flying blind on logistics. Last year he under-ordered restrooms for the food truck rally because he had no attendance estimate. Food truck vendors ask him for foot traffic projections to decide how much inventory to bring — he can only guess. City services need attendance estimates for road closure permits. Every event management platform Carlos has used (Eventbrite, Meetup) provides this data automatically. Its absence forces him to use a separate tool and manually cross-reference.

## Persona Context

> **Carlos Rivera** — Carlos coordinates the annual 'Taste of Augusta' food truck rally and several smaller community events. He needs the admin tools to create events with accurate impact zones, set the right dates and times, and link them to participating venues. He also wants to see how his events appear on the public map.
