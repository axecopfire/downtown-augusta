# Feature Request: No real-time open/closed status for businesses

| Field | Value |
|-------|-------|
| **Reporter** | Derek Sullivan (Visitor shopping for a Halloween costume) |
| **Priority** | 🟠 HIGH |
| **Type** | Feature Request |
| **Page** | `/map` |

## Description

It's the weekend and I need a costume shop that's actually open RIGHT NOW. I clicked a business marker and here's what the popup shows:

> Artist Row on Broad
> 
> RETAIL
> 
> 📍 1168 Broad St, Augusta, GA 30901
> 
> 📞 (706) 955-0202
> 
> 🕐 Tue-Sat 11am-6pm

Hours displayed in popup: true. 'Open Now' badge: false. Hours data in API: true.

Even if hours are listed somewhere, there's no computed 'Open Now' / 'Closed' indicator. I have to read the hours text, figure out what day it is, and mentally calculate whether the shop is currently open. Google Maps shows a green 'Open' or red 'Closed' badge instantly. For a visitor in a hurry, this is the difference between visiting a shop and wasting a trip to a closed storefront. I don't want to walk 6 blocks to find a locked door.

## Steps to Reproduce

1. Navigate to /map and click a business marker
2. Look for an 'Open Now' or 'Closed' indicator — none exists
3. Look for business hours — may or may not be displayed
4. Check /admin/businesses for hours column
5. No real-time open/closed computation anywhere on the site

## Expected Behavior

Each business listing (popup, card, or detail page) should show a real-time 'Open Now' (green) or 'Closed' (red) badge computed from the business's operating hours and the current day/time. Ideally, the map markers themselves could show this (e.g., dimmed markers for closed businesses).

## Actual Behavior

Hours in popup: true. Open/Closed badge: false. Hours data in API: true. No dynamic open/closed computation. Hours, if shown, are static text only.

## User Impact

Visitors waste time traveling to businesses that turn out to be closed. This is especially painful for out-of-town visitors unfamiliar with the area. It erodes trust in the site — if I walk to a 'recommended' shop and it's closed, I'll never use this site again. An 'Open Now' filter would be the single most useful feature for someone physically walking around downtown looking for an open shop.

## Persona Context

> **Derek Sullivan** — Derek is visiting Augusta from Atlanta for a friend's Halloween party this weekend. He needs a costume ASAP and wants to find retail shops downtown that might carry costumes, vintage clothing, or craft supplies. He's never been to downtown Augusta and is relying on this site to navigate the area quickly.
