# Bug Report: No way to identify business type from map markers — must click each one individually

| Field | Value |
|-------|-------|
| **Reporter** | Derek Sullivan (Visitor shopping for a Halloween costume) |
| **Priority** | 🟠 HIGH |
| **Type** | Bug Report |
| **Page** | `/map` |

## Description

I spent several minutes clicking through markers on the map trying to find retail shops. Out of 5 markers I checked, here's what I found in popups:

**Marker 1:** Artist Row on Broad |  | RETAIL |  | 📍 1168 Broad St, Augusta, GA 30901 |  | 📞 (706) 955-0202 |  | 🕐 Tue-Sat 11am-6pm

**Marker 2:** Downtown Walking Tour |  | COMMUNITY · IMPACT: LOW |  | Guided afternoon walking tour exploring Augusta's historic downtown landmarks and architecture. |  | 📅 Apr 8, 2026 |  | 🕐 2:00 PM – 4:00 PM |  | 📍 Augusta Museum of History, 560 Reynolds St, Augusta, GA 30901

**Marker 3:** Augustino's Italian Eatery |  | RESTAURANT |  | 📍 1109 Broad St, Augusta, GA 30901 |  | 📞 (706) 860-4445 |  | 🕐 Mon-Sat 11am-9pm

**Marker 4:** Boll Weevil Café & Sweetery |  | RESTAURANT |  | 📍 10 James Brown Blvd, Augusta, GA 30901 |  | 📞 (706) 722-7772 |  | 🕐 Mon-Sat 11am-10pm |  | 🔗 Website |  | Recent Posts |  | Happy Easter from everyone at the Boll Weevil! Enjoy our spe… |  | 4d ago

**Marker 5:** Craft & Vine |  | BAR |  | 📍 1002 Broad St, Augusta, GA 30901 |  | 📞 (706) 364-5300 |  | 🕐 Tue-Sat 5pm-12am

Category shown in popup: false. Retail shop found: true.

The markers all look the same — blue pins for businesses. There's no color coding by category, no icons to distinguish a restaurant from a retail shop, and no legend. I have to click EVERY marker to read the popup and figure out what kind of business it is. I found 1 distinct marker style(s), which is not enough to differentiate business types at a glance. On Google Maps, different business types have different icons (shopping bag for retail, fork/knife for restaurants). This site treats every business the same visually.

## Steps to Reproduce

1. Navigate to /map and wait for markers to load
2. Observe that all business markers appear identical (blue pins)
3. Click markers one by one to discover what type of business each is
4. Check 5 markers — tedious process to find any retail shop

## Expected Behavior

Different marker icons or colors for each business category (retail = shopping bag, restaurant = fork/knife, bar = cocktail glass, etc.) with a visible legend. Visitors should identify business types at a glance without clicking.

## Actual Behavior

All business markers use the same blue pin icon. 1 unique marker style(s) detected across all markers. No legend or category color coding. Must click each marker individually to learn the business type.

## User Impact

A visitor looking for a specific type of business (costume shop, restaurant, bar) must click through every marker — there could be dozens. This is a terrible user experience that wastes visitors' time. Combined with no search/filter, it makes the map nearly unusable for anyone with a specific goal. I'm about to give up and just use Google Maps.

## Persona Context

> **Derek Sullivan** — Derek is visiting Augusta from Atlanta for a friend's Halloween party this weekend. He needs a costume ASAP and wants to find retail shops downtown that might carry costumes, vintage clothing, or craft supplies. He's never been to downtown Augusta and is relying on this site to navigate the area quickly.
