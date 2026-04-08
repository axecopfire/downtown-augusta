# Feature Request: Recurring event support for weekly and monthly events

| Field | Value |
|-------|-------|
| **Reporter** | Carlos Rivera (Community event organizer) |
| **Priority** | 🔴 CRITICAL |
| **Type** | Feature Request |
| **Page** | `/admin/events/new` |

## Description

The event creation form has no recurrence options. Carlos runs a weekly Food Truck Friday gathering every Friday evening from April through October — that's 30 events. Currently he must create each one individually, manually entering the same title, description, address, impact zone, and category 30 times with only the date changing.

## Steps to Reproduce

1. Navigate to /admin/events/new
2. Look for recurrence options: weekly, biweekly, monthly, custom
3. Search for 'Repeat', 'Recurring', or 'Frequency' controls
4. None found — the form only supports single-date events

## Expected Behavior

A 'Repeat' toggle should reveal frequency options: daily, weekly, biweekly, monthly, or custom. The user picks an end date or count, and the system auto-generates individual event instances. Each instance should be editable independently (for one-off changes like rain dates). Google Calendar, Eventbrite, and every modern calendar app support this natively.

## Actual Behavior

No recurrence UI exists. Every event must be created individually with all fields re-entered from scratch.

## User Impact

Carlos spends an entire afternoon at the start of each season creating 30 identical Food Truck Friday events. This is error-prone — typos in addresses mean food trucks show up at the wrong pin on the map, and inconsistent impact levels cause wrong road closure colors. The manual process also means he delays publishing the full schedule, which hurts vendor planning and public attendance. A recurring event feature would reduce 30 creation steps to 1.

## Persona Context

> **Carlos Rivera** — Carlos coordinates the annual 'Taste of Augusta' food truck rally and several smaller community events. He needs the admin tools to create events with accurate impact zones, set the right dates and times, and link them to participating venues. He also wants to see how his events appear on the public map.
