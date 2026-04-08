# Feature Request: Restaurant map popups lack social media links, photos, and menu info

| Field | Value |
|-------|-------|
| **Reporter** | Tamika Washington (Local food blogger and Instagram influencer) |
| **Priority** | 🟠 HIGH |
| **Type** | Feature Request |
| **Page** | `/map` |

## Description

When clicking a restaurant marker on the map, the popup shows basic info: name, category, address, phone, hours, and website link. But for food discovery, critical information is missing: no Instagram or Facebook links, no food photos, no menu link, and no indication of cuisine type or price range. Compare this to Google Maps, which shows photos, ratings, and cuisine tags in the popup — or Yelp, which includes price range and recent photo reviews. The popup has a 'Social Posts' section but only shows text snippets, not embedded social content with images.

## Steps to Reproduce

1. Navigate to /map and wait for markers to load
2. Click on a restaurant marker (e.g., Frog Hollow Tavern, Soul Bar)
3. Read the popup content
4. Note: name, address, phone, hours, and website are shown
5. Note: Instagram link, Facebook link, food photos, and menu link are all missing

## Expected Behavior

Restaurant popups should include: Instagram and Facebook profile links (the data exists in the admin — instagramUrl and facebookUrl fields), a photo carousel of the restaurant or recent food posts, a 'View Menu' link, cuisine tags, and a price range indicator. This turns a basic listing into a shareable food discovery experience.

## Actual Behavior

The popup shows: address, phone, hours. No social media links, no photos, no menu link. The instagramUrl and facebookUrl fields exist in the database but are not surfaced in the public popup.

## User Impact

When I discover a new restaurant on this map, I immediately want to check their Instagram to see their food photography, repost their content, and tag them in my stories. Without social links in the popup, I have to manually search for each restaurant on Instagram — defeating the purpose of a discovery tool. My 15K followers expect direct links when I recommend a spot.

## Persona Context

> **Tamika Washington** — Tamika runs '@TasteAugusta' on Instagram with 15K followers. She's always scouting new restaurants and food events downtown. She wants to use this site to find all food-related businesses, check their social media presence, and discover upcoming food events to feature on her blog.
