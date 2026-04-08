# Downtown Augusta — Prioritized Development Backlog

> Generated from user testing by 5 persona agents (Martha, Derek, Priya, Carlos, Tamika).
> 32 raw reports triaged, deduplicated, and consolidated into 16 backlog items.

---

## 🔴 P0 — Critical (Core Experience Broken)

These issues fundamentally prevent the site from serving its purpose. Users will leave immediately.

### ✅ BACKLOG-001: Create Public Events Page & Fix Navigation
**Status:** COMPLETE
**Reported by:** Priya (tourist), Derek (shopper), Tamika (blogger)
**Raw reports:** BUG-004-events-nav-link, FEATURE-004-no-public-events-page, FEATURE-005-need-a-public-events-page

**Problem:** The "Events" link in the header navigation takes users directly to `/admin/events` — an admin CRUD table with delete buttons. There is no public-facing events page. Visitors see raw admin UI and immediately lose trust.

**Impact:** Every tourism site has a public events page. This is the #1 reason tourists visit a city portal. Priya said: *"Seeing an admin page makes me question whether this site is even meant for the public. I'd immediately leave."* Derek couldn't find Halloween events at all. Tamika can't discover food events to promote to her 15K followers.

**Solution:** Create a `/events` public page with event cards, date filtering, category filtering, and attractive design. Update header nav to point to `/events` instead of `/admin/events`.

**Scope:** New page + route change + API integration (GET /api/events?category=&upcoming=true already exists)

---

### ✅ BACKLOG-002: Add Search & Category Filters to Map Page
**Status:** COMPLETE
**Reported by:** Derek (shopper), Martha (owner), Priya (tourist), Tamika (blogger)
**Raw reports:** FEATURE-002-map-page-has-no-search, FEATURE-002-map-page-needs-search, FEATURE-003-map-needs-category-filters

**Problem:** The map has no search bar and no category filter controls. Users must click every single marker one-by-one to find a specific business type. The API already supports `GET /api/businesses?category=retail` but the UI doesn't expose it.

**Impact:** This was reported by ALL personas — it's the single most requested feature. Derek said: *"This is a dealbreaker for any visitor with a specific goal."* Martha couldn't find her own business. Priya clicked 4 markers before finding a restaurant. With 120+ businesses, clicking each marker is impractical.

**Solution:** Add a search bar (name/keyword) and category filter dropdown/chips to the `/map` page. Filter markers dynamically. Consider a sidebar list view alongside the map.

**Scope:** Map page UI additions + client-side filtering of existing marker data

---

### ✅ BACKLOG-003: Surface Social Media Links on Public Pages
**Status:** COMPLETE
**Reported by:** Tamika (blogger), Martha (owner)
**Raw reports:** BUG-004-social-media-information-is-admin-only, FEATURE-005-social-media-feeds-not-visible

**Problem:** Business Instagram/Facebook URLs and social posts are stored in the database and manageable via admin, but NONE of this information appears on the public map. Customers visiting the site cannot see any social media links or content.

**Impact:** Tamika called this a *"dealbreaker for food bloggers"* — she always links restaurant Instagram pages when featuring them. Martha wants customers to find her social media to see new book arrivals and event photos. Social links are the bridge between discovery and engagement.

**Solution:** Add social media icons/links to map popup business cards. Show Instagram/Facebook URLs when available.

**Scope:** Modify map popup template to include social links from existing data

---

### ✅ BACKLOG-004: Create Shareable Business Profile Pages
**Status:** COMPLETE
**Reported by:** Tamika (blogger)
**Raw reports:** FEATURE-006-no-way-to-share-or-link-to-individual-business-listings

**Problem:** There are no individual business pages with permanent URLs. Map popups don't change the URL. Bloggers, businesses, and visitors cannot share a link to a specific business listing.

**Impact:** Tamika has 15K Instagram followers and writes restaurant roundup posts. Without shareable URLs, she can't link to businesses from her blog, embed listings, or direct followers to specific restaurants. This is lost marketing for every downtown business.

**Solution:** Create `/businesses/[id]` public detail pages with rich content (description, photos, hours, social links, upcoming events, map). Update map popups to include "View Details" links.

**Scope:** New dynamic route + detail page component + SEO metadata

---

## 🟠 P1 — High (Major UX Gaps)

These significantly degrade the user experience but don't completely block core tasks.

### BACKLOG-005: Category-Distinct Map Marker Icons ✅ COMPLETE
**Reported by:** Derek (shopper), Tamika (blogger), Priya (tourist)
**Raw reports:** BUG-003-no-way-to-identify-business-type, FEATURE-001-map-markers-need-distinct-icons, FEATURE-002-business-markers-need-category-specific

**Problem:** All business markers are identical blue pins. Users cannot visually distinguish restaurants from retail shops, bars, or hotels without clicking each marker.

**Impact:** Derek spent several minutes clicking markers to find retail shops. Tamika needs to quickly spot restaurant clusters for food photography routes. Google Maps and Yelp use category icons — users expect this.

**Solution:** Use distinct marker icons or colors per business category (restaurant=fork icon, bar=glass, retail=bag, etc.). Update the map legend accordingly.

**Scope:** Custom Leaflet marker icons per category + legend update

---

### BACKLOG-006: Create Public Business Directory Page ✅ COMPLETE
> *Completed as part of BACKLOG-004 (P0). Created `/businesses` directory with search, category filters, card grid, and `/businesses/[id]` detail pages.*

**Reported by:** Tamika (blogger)
**Raw reports:** FEATURE-003-need-a-public-business-directory-page

---

### BACKLOG-007: Homepage Featured Events & Search ✅ COMPLETE
**Reported by:** Priya (tourist), Derek (shopper), Martha (owner)
**Raw reports:** FEATURE-001-homepage-needs-featured-upcoming-events, FEATURE-001-homepage-lacks-category-quick-links, FEATURE-001-homepage-needs-a-search-bar

**Problem:** The homepage has a static hero and generic stats but no search functionality, no upcoming events preview, and no quick category links. First-time visitors can't answer "What's happening?" or find anything specific.

**Impact:** Priya said: *"First-time visitors bounce when a tourism site doesn't immediately answer 'What's happening?'"* Derek needed quick links to retail shops. Martha wanted to search for her business. The homepage should be the entry point to discovery.

**Solution:** Add a search bar, upcoming events carousel (next 5 events), and category quick-link buttons (Restaurants, Shops, Events, Entertainment) to the homepage.

**Scope:** Homepage component additions + data fetching for upcoming events

---

### BACKLOG-008: Enrich Map Popup Content ✅ COMPLETE
**Reported by:** Martha (owner), Tamika (blogger), Priya (tourist)
**Raw reports:** FEATURE-006-map-popups-lack-business-hours-photos, FEATURE-002-restaurant-map-popups-lack-social-media

**Problem:** Map popups show only basic text (name, category, address). Missing: photos, social links, upcoming events at that business, and rich formatting.

**Impact:** Martha wants customers to see *"Oh, they're open until 9pm tonight and there's a poetry reading on Saturday — let's go!"* Tamika needs Instagram links in popups to feature restaurants. Richer popups increase click-through and foot traffic.

**Solution:** Enhance popup content to include: business photo thumbnail, social media icon links, next upcoming event (if any), and a "View Details" link to the business profile page (BACKLOG-004).

**Scope:** Popup template enhancement + include related data in map data fetch

---

### BACKLOG-009: Add Google Maps Directions Link ✅ COMPLETE
> *Completed as part of BACKLOG-003 (P0). Added "Get Directions" Google Maps link to all business popups.*

**Reported by:** Derek (shopper)
**Raw reports:** FEATURE-005-no-directions-or-navigation-link

---

### BACKLOG-010: Open/Closed Status Indicator ✅ COMPLETE
**Reported by:** Derek (shopper)
**Raw reports:** FEATURE-006-no-real-time-open-closed-status

**Problem:** Business popups show hours text but no computed "Open Now" / "Closed" badge. Visitors can't quickly tell which businesses are currently open.

**Impact:** Derek is walking downtown looking for an open costume shop RIGHT NOW. He said: *"If I walk to a 'recommended' shop and it's closed, I'll never use this site again."*

**Solution:** Parse business hours and display an "Open Now" (green) or "Closed" (red) badge in map popups and business listings. Fall back gracefully if hours format is unparseable.

**Scope:** Hours parsing utility + badge component + popup/listing integration

---

### BACKLOG-011: Many-to-Many Event-Business Relationships ✅ COMPLETE
**Reported by:** Carlos (organizer)
**Raw reports:** FEATURE-002-many-to-many-event-business-relationships

**Problem:** Events can only link to ONE business (single `businessId` foreign key). Multi-vendor events like food truck rallies involve 20+ businesses.

**Impact:** Carlos said: *"Without many-to-many linking, visitors can't discover which businesses are participating from the event page, and businesses can't showcase their involvement."* The Taste of Augusta rally has 25+ food trucks.

**Solution:** Create an `EventBusiness` join table in Prisma. Update admin UI for multi-select. Update event display to show participating businesses.

**Scope:** Schema migration + admin UI changes + public display updates

---

### BACKLOG-012: Fix Mobile Usability ✅ COMPLETE
**Reported by:** Derek (shopper)
**Raw reports:** BUG-007-mobile-usability-issues

**Problem:** At mobile viewport (375×667), navigation links and map interactions have issues. Mobile is the primary use case — people physically downtown on their phones.

**Impact:** Derek: *"I'm literally standing on Broad Street trying to find a costume shop on my phone."* If the mobile experience is poor, the site fails its core mission.

**Solution:** Audit and fix responsive design: hamburger menu, map touch interactions, popup sizing, table overflow on admin pages.

**Scope:** CSS/responsive fixes across multiple components

---

## 🟡 P2 — Medium (Important Enhancements)

Valuable improvements that enhance power-user and admin workflows.

### BACKLOG-013: Admin Table Sorting, Filtering & Recurring Events
**Reported by:** Carlos (organizer)
**Raw reports:** FEATURE-001-admin-events-table-needs-sorting, FEATURE-004-recurring-event-support, FEATURE-003-add-map-preview

**Problem:** The admin events table has no sort/filter controls. There's no recurring event support (Carlos manually creates 30 weekly events). No preview of how events appear on the public map.

**Impact:** Carlos manages 30+ events/year and wastes time scrolling through an unsorted list. Weekly Food Truck Friday events require individual creation — error-prone and tedious.

**Solution:** Phase 1: Add sort/filter to admin tables. Phase 2: Recurrence UI (weekly/monthly repeat with date range). Phase 3: Mini map preview in event editor.

**Scope:** Admin UI enhancements + recurrence logic + preview component

---

### BACKLOG-014: RSVP & Attendance Tracking
**Reported by:** Carlos (organizer)
**Raw reports:** FEATURE-005-rsvp-and-attendance-tracking

**Problem:** No way to track RSVPs or expected attendance for events. Organizers need foot traffic estimates for logistics planning.

**Impact:** Carlos under-ordered restrooms last year because he had no attendance estimate. Food truck vendors need projections to plan inventory.

**Solution:** Add RSVP model (email + event), display count on admin event page, optional public "I'm interested" button.

**Scope:** New schema + API + admin display + optional public widget

---

### BACKLOG-015: Event Duplication & Templates
**Reported by:** Carlos (organizer)
**Raw reports:** FEATURE-006-event-duplication-and-template-system

**Problem:** No way to duplicate events or save templates. Annual festivals have the same venue, polygon, description — only dates change.

**Impact:** Carlos redraws a 6-block polygon impact zone every year. Last year he placed a vertex on the wrong block due to manual re-entry.

**Solution:** Add "Duplicate Event" button on event edit page that pre-fills a new event form with copied data. Clear dates for manual entry.

**Scope:** Admin UI button + form pre-fill logic

---

## 🟢 P3 — Low (Future Vision)

Nice-to-have features for a mature platform.

### BACKLOG-016: Itinerary Builder, Rich Event Detail & Curated Collections
**Reported by:** Priya (tourist)
**Raw reports:** FEATURE-005-no-itinerary, FEATURE-006-event-popups-lack-rich-detail, FEATURE-007-no-curated-experience-categories

**Problem:** No trip planner / save favorites. Event popups lack "Add to Calendar" and share buttons. No curated collections like "Nightlife" or "Date Night".

**Impact:** Priya plans her weekend in Google Maps instead, never returning to this site. Curated categories would drive blog traffic back to Augusta's platform.

**Solution:** Future phases: Favorites/bookmarks (localStorage initially), "Add to Calendar" (.ics download), curated collection pages.

**Scope:** Multiple features — plan for future sprints

---

## Summary

| Priority | Count | Theme |
|----------|-------|-------|
| 🔴 P0 Critical | 4 | Public pages, search, social visibility, shareability |
| 🟠 P1 High | 8 | Map UX, directions, open status, mobile, homepage, data model |
| 🟡 P2 Medium | 3 | Admin tools, recurring events, RSVP |
| 🟢 P3 Low | 1 | Itinerary, rich detail, curated collections |
| **Total** | **16** | |

### Suggested Sprint Plan

**Sprint 1 (P0 — Foundation):** BACKLOG-001 through BACKLOG-004
- Public events page + fix nav routing
- Map search & category filters
- Social media links on public pages
- Business profile pages with permalinks

**Sprint 2 (P1 — Map & Discovery):** BACKLOG-005 through BACKLOG-010
- Category marker icons
- Public business directory
- Homepage featured events & search
- Enriched map popups
- Directions links
- Open/closed status

**Sprint 3 (P1 + P2 — Data & Admin):** BACKLOG-011 through BACKLOG-015
- Many-to-many event-business
- Mobile fixes
- Admin table improvements
- Recurring events
- RSVP tracking
- Event duplication

**Sprint 4 (P3 — Polish):** BACKLOG-016
- Itinerary builder
- Calendar integration
- Curated collections
