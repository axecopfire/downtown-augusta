# Bug Report: Social media information is admin-only — not visible to public visitors

| Field | Value |
|-------|-------|
| **Reporter** | Tamika Washington (Local food blogger and Instagram influencer) |
| **Priority** | 🔴 CRITICAL |
| **Type** | Bug Report |
| **Page** | `/admin/businesses/cmnq6dfhe0007josb1b39ic0x/edit` |

## Description

Restaurant social media data is completely locked behind the admin interface. The Social Feed tab (at /admin/businesses/[id]/edit) allows admins to manage posts, and the Info tab has fields for instagramUrl and facebookUrl — but NONE of this information is accessible from the public map or any public page. Visitors and food bloggers cannot see a restaurant's Instagram feed, Facebook posts, or social profile links. This is a critical gap: social media integration is the #1 way food bloggers discover and promote restaurants.

## Steps to Reproduce

1. Navigate to /admin/businesses/cmnq6dfhe0007josb1b39ic0x/edit for Augustino's Italian Eatery
2. Click the 'Social Feed' tab — see social post management (admin-only)
3. Found 0 social post(s) — these are invisible to public visitors
4. Click the 'Info' tab — see instagramUrl and facebookUrl fields
5. Instagram URL: (empty), Facebook URL: (empty)
6. Navigate to /map, find the same restaurant marker — no social links in popup
7. No public route exists to view a restaurant's social media presence

## Expected Behavior

Social media links (Instagram, Facebook) should appear in map popups and on any public business profile page. Social posts should be displayed as an embedded feed that visitors can browse — similar to how Google Business profiles show recent posts or how restaurant websites embed their Instagram grid.

## Actual Behavior

Admin can add social posts (0 found). Instagram/Facebook URL fields exist. However, this social data is NOT visible to public visitors on the map or any public page.

## User Impact

This is a dealbreaker for food bloggers. When I feature a restaurant, I always link to their Instagram so my followers can see their food photography and follow them. If this site doesn't surface social media links, food bloggers will bypass it entirely and just use Google Maps or Yelp. The social data EXISTS in the system — it just needs to be exposed publicly. This is a massive missed marketing opportunity for downtown restaurants.

## Persona Context

> **Tamika Washington** — Tamika runs '@TasteAugusta' on Instagram with 15K followers. She's always scouting new restaurants and food events downtown. She wants to use this site to find all food-related businesses, check their social media presence, and discover upcoming food events to feature on her blog.
