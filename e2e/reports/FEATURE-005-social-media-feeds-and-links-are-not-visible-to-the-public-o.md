# Feature Request: Social media feeds and links are not visible to the public — only in admin

| Field | Value |
|-------|-------|
| **Reporter** | Martha Kingsley (Owner of The Book Tavern) |
| **Priority** | 🟡 MEDIUM |
| **Type** | Feature Request |
| **Page** | `http://localhost:3000/map` |

## Description

I found the Social Feed tab on my business's admin edit page, which is great for managing posts. However, when I visit the public-facing map and click on a business marker, there are no social media links shown in the popup. My customers visiting the map can't see my Instagram, Facebook, or any of the social posts I've added. The social features are admin-only, which defeats the purpose. I want my customers to discover my @BookTavernAugusta Instagram directly from the map, see photos of our cozy reading nook, and know about upcoming events I post on social media.

## Steps to Reproduce

1. Navigate to http://localhost:3000/admin/businesses and edit The Book Tavern
2. Go to the Social Feed tab — notice you can add social posts here
3. Check the Info tab for Facebook/Instagram URL fields
4. Now navigate to http://localhost:3000/map as a regular customer would
5. Click on The Book Tavern's marker (or any business marker)
6. Notice the popup only shows basic info — no social media links or feed

## Expected Behavior

Business popups on the public map should include clickable social media icons (Instagram, Facebook) when the business has those URLs set. Ideally, a small preview of recent social posts or a 'Follow us' section would appear, encouraging customers to engage with the business online.

## Actual Behavior

Social media URLs and the social feed are only accessible through the admin edit page. The public map popups and any public business views do not display social media links or posts.

## User Impact

Social media is how I connect with customers between visits. My Instagram showcases new book arrivals, author signings, and the warm atmosphere of The Book Tavern. If customers on the map can't see my social links, I'm missing a major channel for engagement and repeat visits. Other business owners who invest in social media feel the same — the platform should bridge the gap between the directory and social presence.

## Persona Context

> **Martha Kingsley** — Martha has run The Book Tavern on Broad Street for 12 years. She hosts weekly author readings and open-mic poetry nights. She heard Downtown Augusta launched a website to promote local businesses and wants to make sure her shop is represented well — accurate hours, upcoming events, and a link to her social pages so customers can find her easily.
