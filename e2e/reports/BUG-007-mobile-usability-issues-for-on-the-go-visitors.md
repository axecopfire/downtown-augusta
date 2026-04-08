# Bug Report: Mobile usability issues for on-the-go visitors

| Field | Value |
|-------|-------|
| **Reporter** | Derek Sullivan (Visitor shopping for a Halloween costume) |
| **Priority** | 🟠 HIGH |
| **Type** | Bug Report |
| **Page** | `/map` |

## Description

I'm walking around downtown Augusta using my phone to find a costume shop. I tested the site at 375×667 (iPhone SE) and found several issues:

- **Homepage hero visible:** true
- **Hamburger/mobile menu:** Found
- **Navigation links visible:** 7
- **Map fills mobile screen:** true
- **Map markers on mobile:** 12
- **Popup readable on mobile:** false
- **Admin table overflows on mobile:** true

The map is the most important feature for a mobile visitor physically walking around downtown. Markers need to be large enough to tap accurately on a touchscreen. Popups need to be readable without zooming. If the navigation menu doesn't work on mobile, visitors are stuck on whatever page they land on. This is likely the most common use case — someone on their phone, walking downtown, trying to find a business.

## Steps to Reproduce

1. Open the site on a mobile device (375×667 viewport)
2. Check that navigation menu is accessible (hamburger icon or visible links)
3. Navigate to /map — verify the map fills the screen
4. Try tapping a marker — check popup is readable
5. Navigate to /admin/businesses — check table layout

## Expected Behavior

Fully responsive mobile experience: hamburger menu for navigation, full-width map, tap-friendly markers, readable popups that don't overflow the screen, and responsive tables that scroll horizontally or stack vertically.

## Actual Behavior

Hero visible: true. Mobile menu: Present. Map fills screen: true. Popup readable: false. Table overflows: true. Mobile experience has gaps that make the site hard to use while walking around downtown.

## User Impact

The primary use case for this site is someone physically in downtown Augusta using their phone. If the mobile experience is poor, the site fails its core mission. I'm literally standing on Broad Street right now trying to find a costume shop on my phone — if I can't navigate the site or read business info, I'll just open Google Maps instead. Every mobile usability issue directly translates to lost foot traffic for downtown businesses.

## Persona Context

> **Derek Sullivan** — Derek is visiting Augusta from Atlanta for a friend's Halloween party this weekend. He needs a costume ASAP and wants to find retail shops downtown that might carry costumes, vintage clothing, or craft supplies. He's never been to downtown Augusta and is relying on this site to navigate the area quickly.
