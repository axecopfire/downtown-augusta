# Feature Request: Need a public business directory page with category filtering

| Field | Value |
|-------|-------|
| **Reporter** | Tamika Washington (Local food blogger and Instagram influencer) |
| **Priority** | 🟠 HIGH |
| **Type** | Feature Request |
| **Page** | `/admin/businesses` |

## Description

The only place to see a list of all businesses is the admin page at /admin/businesses. This page shows a table with names, addresses, category badges, event counts, and social post counts — but it's an admin interface with 'Add Business' and 'Delete' buttons. There is no public-facing business directory for visitors. A food blogger needs a clean, public directory where I can filter by 'Restaurant' or 'Bar' and browse all dining options with photos and descriptions — like a Yelp-style browse page.

## Steps to Reproduce

1. Navigate to /admin/businesses
2. See the business table with category badges (restaurant, bar, retail, etc.)
3. Note there is no category filter dropdown to show only restaurants
4. Note this is an admin page with Add/Delete controls — not suitable for public visitors
5. No public route like /businesses or /directory exists

## Expected Behavior

A public /businesses or /directory page with: category filter tabs or dropdown (Restaurant, Bar, Retail, etc.), card-based layout with business photos, description previews, social media links, and sort options (by name, popularity, newest). The API already supports filtering — GET /api/businesses?category=restaurant works.

## Actual Behavior

The admin table shows 10 businesses with category badges but no filtering. The only way a visitor can browse businesses by category is through the map sidebar filter pills. There's no dedicated public directory page.

## User Impact

I frequently send my Instagram followers to explore downtown dining. A shareable URL like '/businesses?category=restaurant' would let me link directly to all restaurants in one view — perfect for 'Top 10 Downtown Augusta Restaurants' blog posts. Without this, I can't create useful roundup content that drives traffic to the site and to local businesses.

## Persona Context

> **Tamika Washington** — Tamika runs '@TasteAugusta' on Instagram with 15K followers. She's always scouting new restaurants and food events downtown. She wants to use this site to find all food-related businesses, check their social media presence, and discover upcoming food events to feature on her blog.
