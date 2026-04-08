# Feature Request: Map popups lack business hours, photos, and upcoming events

| Field | Value |
|-------|-------|
| **Reporter** | Martha Kingsley (Owner of The Book Tavern) |
| **Priority** | 🟠 HIGH |
| **Type** | Feature Request |
| **Page** | `http://localhost:3000/map` |

## Description

As a business owner, I checked how my listing looks to customers on the public map. When you click a marker, the popup shows the business name and some basic info, but it's missing key details that customers need: upcoming events, business photos. A customer clicking on The Book Tavern's pin should immediately see our hours (Mon–Sat 10am–9pm, Sun 12–6pm), a photo of our storefront or interior, and know that we have an author reading this Thursday. Without this, the popup is just a glorified address label — customers have to look elsewhere for the details that would actually get them through the door.

## Steps to Reproduce

1. Navigate to http://localhost:3000/map
2. Wait for the map to load with business markers
3. Click on any business marker to open its popup
4. Observe what information is displayed in the popup
5. Notice missing: business hours, photos, upcoming events, social links

## Expected Behavior

Each business popup should display: (1) Business name and category, (2) Address, (3) Phone number, (4) Business hours with open/closed indicator, (5) A small photo of the business, (6) Upcoming events at this location, (7) Social media icons linking to the business's profiles, (8) A 'Get Directions' link.

## Actual Behavior

The popup shows the business name and basic contact info. Missing: upcoming events, business photos. The popup doesn't give customers enough information to decide whether to visit.

## User Impact

When someone clicks on The Book Tavern's marker, I want them to think 'Oh, they're open until 9pm tonight and there's a poetry reading on Saturday — let's go!' Instead, they see a bare-bones popup and might keep scrolling. Richer popups would increase foot traffic for all downtown businesses. This is especially important for businesses like mine that differentiate on atmosphere and events, not just location.

## Persona Context

> **Martha Kingsley** — Martha has run The Book Tavern on Broad Street for 12 years. She hosts weekly author readings and open-mic poetry nights. She heard Downtown Augusta launched a website to promote local businesses and wants to make sure her shop is represented well — accurate hours, upcoming events, and a link to her social pages so customers can find her easily.
