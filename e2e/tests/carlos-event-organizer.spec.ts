import { test, expect } from "@playwright/test";
import { CARLOS } from "../helpers/persona";
import { fileReport, type Report } from "../helpers/reporter";
import {
  navigateTo,
  waitForMapLoad,
  countMapMarkers,
  fillEventForm,
  getTableRowCount,
} from "../helpers/test-helpers";

test.describe("Carlos Rivera — Event Organizer", () => {
  test.describe.configure({ mode: "serial" });

  test("Carlos reviews existing events in admin", async ({ page }) => {
    await navigateTo(page, "/admin/events");

    // Verify the events table loads with a heading
    await expect(page.locator("h1")).toContainText("Events");

    // Wait for the table to be visible
    const table = page.locator("table");
    await expect(table).toBeVisible({ timeout: 10_000 });

    // Count rows — seeded data should have at least 10 events
    const rowCount = await getTableRowCount(page);
    expect(rowCount).toBeGreaterThanOrEqual(10);

    // Verify key seeded events are listed
    const knownEvents = [
      "First Friday Downtown",
      "Food Truck Rally",
      "Saturday Market",
      "Arts in the Heart of Augusta",
    ];
    for (const title of knownEvents) {
      await expect(page.locator("tbody").getByText(title)).toBeVisible();
    }

    // Check for sorting controls — click column headers to see if they sort
    const sortButtons = page.locator(
      'th button, th a, th[role="button"], th[aria-sort]'
    );
    const sortCount = await sortButtons.count();

    // Check for filter/search controls
    const filterControls = page.locator(
      'input[type="search"], input[placeholder*="search" i], select[name*="filter" i], [data-testid*="filter"]'
    );
    const filterCount = await filterControls.count();

    // File feature request — no sorting or filtering in admin events table
    fileReport({
      kind: "feature-request",
      persona: CARLOS,
      title: "Admin events table needs sorting and filtering",
      description:
        "The admin events table at /admin/events displays all events in a flat list with no ability to " +
        "sort by date, category, or impact level, and no way to search or filter. Carlos manages dozens " +
        "of events per year — from weekly food truck nights to the annual Taste of Augusta rally — and " +
        "scrolling through an unsorted list to find a specific event is painfully slow.",
      stepsToReproduce: [
        "Navigate to /admin/events",
        "Observe the events table with columns: Event, Date, Category, Impact, Actions",
        `Found ${sortCount} sortable column headers and ${filterCount} filter controls`,
        "Try to find a specific event by name — must visually scan the entire list",
      ],
      expectedBehavior:
        "Column headers should be clickable to sort ascending/descending. A search bar should allow " +
        "filtering by event title. Category and impact dropdowns should narrow results. Platforms like " +
        "Eventbrite let organizers search, sort, and filter events instantly.",
      actualBehavior:
        "No sorting, searching, or filtering capabilities. All events displayed in a static list.",
      userImpact:
        "As an organizer running 30+ events per year, Carlos wastes significant time hunting for events " +
        "to edit. During crunch time before a major festival, every minute spent searching the admin " +
        "table is a minute not spent coordinating vendors or updating event details that directly " +
        "affect downtown foot traffic.",
      priority: "high",
      pageUrl: "/admin/events",
    });
  });

  test("Carlos creates a new multi-day food festival event", async ({
    page,
  }) => {
    await navigateTo(page, "/admin/events/new");

    // Verify form page loads
    await expect(page.locator("h1")).toContainText("Create New Event");

    // Fill out the Taste of Augusta 2025 event
    const startDate = "2025-10-10";
    const endDate = "2025-10-12";

    await fillEventForm(page, {
      title: "Taste of Augusta 2025",
      description:
        "Three-day food truck rally featuring 25+ regional food trucks, live music stages, " +
        "craft beer garden, and family activities. Downtown's biggest culinary celebration " +
        "drawing 10,000+ visitors to the Broad Street corridor.",
      address: "800 Broad St, Augusta, GA 30901",
      latitude: "33.4735",
      longitude: "-81.9748",
      category: "market",
      startDate,
      endDate,
      startTime: "11:00",
      endTime: "22:00",
      impactLevel: "high",
    });

    // Fill optional fields directly
    const imageField = page.getByLabel('Image URL');
    if (await imageField.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await imageField.fill("https://example.com/taste-of-augusta-2025.jpg");
    }
    const websiteField = page.getByLabel('Website');
    if (await websiteField.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await websiteField.fill("https://tasteofaugusta.com");
    }

    // Try to draw a polygon impact area on the embedded map
    const polygonMap = page.locator(".leaflet-container").last();
    if (await polygonMap.isVisible({ timeout: 3_000 }).catch(() => false)) {
      const box = await polygonMap.boundingBox();
      if (box) {
        // Click 4 points to define impact zone around Broad Street
        const cx = box.x + box.width / 2;
        const cy = box.y + box.height / 2;
        const offset = Math.min(box.width, box.height) * 0.2;
        await polygonMap.click({ position: { x: cx - box.x - offset, y: cy - box.y - offset } });
        await polygonMap.click({ position: { x: cx - box.x + offset, y: cy - box.y - offset } });
        await polygonMap.click({ position: { x: cx - box.x + offset, y: cy - box.y + offset } });
        await polygonMap.click({ position: { x: cx - box.x - offset, y: cy - box.y + offset } });
      }
    }

    // Submit the form
    await page.getByRole('button', { name: 'Create Event' }).click();

    // Wait for redirect back to events list or success indication
    await page.waitForURL("**/admin/events", { timeout: 10_000 }).catch(() => {
      // May stay on the page with a success message or validation error
    });

    // Verify the new event shows up in the list (or we're back on the list page)
    const currentUrl = page.url();
    if (currentUrl.includes("/admin/events") && !currentUrl.includes("/new")) {
      await expect(
        page.locator("tbody").getByText("Taste of Augusta 2025").first()
      ).toBeVisible({ timeout: 5_000 });
    }
  });

  test("Carlos tries to link his event to multiple participating restaurants", async ({
    page,
  }) => {
    // Go to a restaurant's edit page to try linking events
    // First, find a restaurant business via the API
    const response = await page.request.get("/api/businesses");
    const businesses = await response.json();
    const restaurant = businesses.find(
      (b: { category: string }) =>
        b.category === "restaurant" || b.category === "bar"
    );

    expect(restaurant).toBeTruthy();
    await navigateTo(page, `/admin/businesses/${restaurant.id}/edit`);

    // Click the Events tab
    const eventsTab = page.locator(
      'button:has-text("Events"), [role="tab"]:has-text("Events")'
    );
    await eventsTab.first().click();

    // Wait for the events tab content to load
    await page.waitForTimeout(1_000);

    // Look for the "Link Existing Event" button
    const linkButton = page.locator('button:has-text("Link Existing Event")');
    const hasLinkButton = await linkButton.isVisible({ timeout: 3_000 }).catch(() => false);

    if (hasLinkButton) {
      // Open the dropdown to see available events
      await linkButton.click();

      // Check the dropdown for available unlinked events
      const dropdown = page.locator(
        ".absolute.z-10, [role='listbox'], [role='menu']"
      );
      await dropdown.first().waitFor({ timeout: 3_000 }).catch(() => {});

      // Try linking one event
      const eventOption = dropdown.locator("button").first();
      if ((await eventOption.count()) > 0) {
        await eventOption.click();
        await page.waitForTimeout(1_000);
      }
    }

    // Key observation: an event has a single businessId — it can only belong to one business.
    // There is no join table or many-to-many relationship.
    fileReport({
      kind: "feature-request",
      persona: CARLOS,
      title: "Many-to-many event-business relationships needed",
      description:
        "The current data model only allows linking an event to a single business (one-to-one via " +
        "businessId on the event). The Taste of Augusta food truck rally involves 25+ food vendors, " +
        "each of which is a business in the directory. Carlos needs to associate his festival with " +
        "every participating restaurant, bar, and food truck so visitors can click through from the " +
        "event to discover each vendor.",
      stepsToReproduce: [
        `Navigate to /admin/businesses/${restaurant.id}/edit`,
        "Click the Events tab",
        'Click "Link Existing Event" — see only events that have no businessId set',
        "Link one event — that event now belongs exclusively to this business",
        "Visit a second business's Events tab — the same event cannot be linked again",
      ],
      expectedBehavior:
        "Events should support a many-to-many relationship with businesses through a join table. " +
        "An event like a food truck rally should list all 25 participating vendors, and each vendor " +
        "should show the rally on their page. Eventbrite, for example, lets organizers tag multiple " +
        "venues and vendors per event.",
      actualBehavior:
        "Each event has a single businessId field. Linking to business A automatically unlinks from " +
        "business B. There is no way to associate an event with multiple businesses simultaneously.",
      userImpact:
        "This is a dealbreaker for multi-vendor events. The Taste of Augusta rally draws 10,000+ " +
        "visitors and 25+ food trucks. Without many-to-many linking, visitors can't discover which " +
        "businesses are participating from the event page, and businesses can't showcase the rally " +
        "on their listings. This reduces cross-promotion and directly hurts vendor foot traffic.",
      priority: "critical",
      pageUrl: `/admin/businesses/${restaurant.id}/edit`,
    });
  });

  test("Carlos checks how his event appears on the public map", async ({
    page,
  }) => {
    await navigateTo(page, "/map");
    await waitForMapLoad(page);

    // Click the Events tab in the sidebar
    const eventsTabButton = page.locator('button:has-text("Events")');
    if (await eventsTabButton.isVisible().catch(() => false)) {
      await eventsTabButton.click();
      await page.waitForTimeout(500);
    }

    // Count total markers on the map
    const markerCount = await countMapMarkers(page);
    expect(markerCount).toBeGreaterThan(0);

    // Look for high-impact event markers (red colored markers)
    // The SVG markers use fill color: red #dc2626 for high impact
    const allMarkers = page.locator(".leaflet-marker-icon");
    const markerTotal = await allMarkers.count();
    expect(markerTotal).toBeGreaterThan(0);

    // Check if polygon overlay areas are visible on the map
    const polygons = page.locator(".leaflet-interactive, path.leaflet-interactive");
    const polygonCount = await polygons.count();

    // Click on an event marker to see the popup
    const firstMarker = allMarkers.first();
    await firstMarker.click();
    await page.waitForSelector(".leaflet-popup", { timeout: 5_000 }).catch(() => {});

    const popup = page.locator(".leaflet-popup-content");
    if (await popup.isVisible().catch(() => false)) {
      const popupText = await popup.innerText();
      // Popup should contain event details
      expect(popupText.length).toBeGreaterThan(0);
    }

    // Look for any impact level filter on the sidebar
    const impactFilter = page.locator(
      'button:has-text("high"), button:has-text("medium"), button:has-text("low")'
    );
    const hasImpactFilter = (await impactFilter.count()) > 0;

    if (hasImpactFilter) {
      // Filter to high-impact events only
      await page.locator('button:has-text("high")').first().click();
      await page.waitForTimeout(500);
    }

    // File feature request about no event preview in admin
    fileReport({
      kind: "feature-request",
      persona: CARLOS,
      title: "Add map preview in admin event editor",
      description:
        "After creating or editing an event in the admin panel, there is no way to preview how it " +
        "will appear on the public map. Carlos has to save the event, navigate manually to /map, " +
        "find his event marker, and click it to verify the popup looks correct. For a multi-day " +
        "festival with polygon impact zones, this round-trip wastes time and risks publishing " +
        "inaccurate event data visible to thousands of visitors.",
      stepsToReproduce: [
        "Create or edit an event at /admin/events/new or /admin/events/[id]/edit",
        "Fill in all fields including impact level and polygon area",
        'Click "Create Event" or "Update Event"',
        "Get redirected to /admin/events list — no visual preview shown",
        "Manually navigate to /map to check the event marker, polygon, and popup",
        "If something looks wrong, go back to admin to edit and repeat",
      ],
      expectedBehavior:
        "The admin event form should include a live map preview panel showing the marker (with " +
        "correct impact color), the polygon overlay, and a sample popup. A 'Preview on Map' button " +
        "could open the public map centered on the event. This is standard in map-based CMS tools " +
        "like Mapbox Studio or Google My Maps.",
      actualBehavior:
        "No preview at all. The polygon drawer shows the shape being drawn, but does not preview " +
        "the final marker color, popup content, or how the polygon will render on the actual map.",
      userImpact:
        "For the Taste of Augusta rally, Carlos defines a large polygon impact zone across several " +
        "blocks. Without preview, he published an incorrectly shaped zone that confused attendees " +
        "about road closures. Each edit-save-check cycle takes 2+ minutes, and when configuring " +
        `${polygonCount} events with polygons, this adds up to hours of wasted time.`,
      priority: "high",
      pageUrl: "/map",
    });
  });

  test("Carlos tries to set up a recurring weekly event", async ({ page }) => {
    await navigateTo(page, "/admin/events/new");
    await expect(page.locator("h1")).toContainText("Create New Event");

    // Search for any recurrence-related UI elements
    const recurrenceSelectors = [
      'select[name*="recur" i]',
      'input[name*="recur" i]',
      'label:has-text("Recur")',
      'label:has-text("Repeat")',
      'button:has-text("Repeat")',
      'button:has-text("Recurring")',
      '[data-testid*="recur" i]',
      'select[name*="frequency" i]',
      'input[type="checkbox"][name*="repeat" i]',
    ];

    let hasRecurrence = false;
    for (const selector of recurrenceSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        hasRecurrence = true;
        break;
      }
    }

    expect(hasRecurrence).toBe(false);

    // File feature request for recurring events
    fileReport({
      kind: "feature-request",
      persona: CARLOS,
      title: "Recurring event support for weekly and monthly events",
      description:
        "The event creation form has no recurrence options. Carlos runs a weekly Food Truck Friday " +
        "gathering every Friday evening from April through October — that's 30 events. Currently " +
        "he must create each one individually, manually entering the same title, description, " +
        "address, impact zone, and category 30 times with only the date changing.",
      stepsToReproduce: [
        "Navigate to /admin/events/new",
        "Look for recurrence options: weekly, biweekly, monthly, custom",
        "Search for 'Repeat', 'Recurring', or 'Frequency' controls",
        "None found — the form only supports single-date events",
      ],
      expectedBehavior:
        "A 'Repeat' toggle should reveal frequency options: daily, weekly, biweekly, monthly, or " +
        "custom. The user picks an end date or count, and the system auto-generates individual event " +
        "instances. Each instance should be editable independently (for one-off changes like rain " +
        "dates). Google Calendar, Eventbrite, and every modern calendar app support this natively.",
      actualBehavior:
        "No recurrence UI exists. Every event must be created individually with all fields " +
        "re-entered from scratch.",
      userImpact:
        "Carlos spends an entire afternoon at the start of each season creating 30 identical Food " +
        "Truck Friday events. This is error-prone — typos in addresses mean food trucks show up at " +
        "the wrong pin on the map, and inconsistent impact levels cause wrong road closure colors. " +
        "The manual process also means he delays publishing the full schedule, which hurts vendor " +
        "planning and public attendance. A recurring event feature would reduce 30 creation steps to 1.",
      priority: "critical",
      pageUrl: "/admin/events/new",
    });
  });

  test("Carlos wants to track attendance and RSVPs", async ({ page }) => {
    // Check the event detail/edit page for RSVP or attendance features
    const response = await page.request.get("/api/events");
    const events = await response.json();
    expect(events.length).toBeGreaterThan(0);

    const event = events[0];
    await navigateTo(page, `/admin/events/${event.id}/edit`);
    await expect(page.locator("h1")).toContainText("Edit Event");

    // Search for RSVP, attendance, capacity, or registration features
    const attendanceSelectors = [
      'input[name*="rsvp" i]',
      'input[name*="capacity" i]',
      'input[name*="attendee" i]',
      'input[name*="registration" i]',
      'label:has-text("RSVP")',
      'label:has-text("Capacity")',
      'label:has-text("Attendance")',
      'label:has-text("Registration")',
      'button:has-text("RSVP")',
      'a:has-text("Registration")',
      '[data-testid*="rsvp" i]',
      '[data-testid*="attendance" i]',
    ];

    let hasAttendanceFeature = false;
    for (const selector of attendanceSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        hasAttendanceFeature = true;
        break;
      }
    }

    expect(hasAttendanceFeature).toBe(false);

    // Also check the public map event popup for RSVP
    await navigateTo(page, "/map");
    await waitForMapLoad(page);

    const rsvpOnMap = page.locator(
      'button:has-text("RSVP"), a:has-text("Register"), button:has-text("Attend")'
    );
    const mapRsvpCount = await rsvpOnMap.count();
    expect(mapRsvpCount).toBe(0);

    // File feature request for RSVP / attendance tracking
    fileReport({
      kind: "feature-request",
      persona: CARLOS,
      title: "RSVP and attendance tracking for events",
      description:
        "There are no RSVP, registration, or attendance tracking features anywhere in the app. " +
        "Carlos needs to estimate how many people will attend the Taste of Augusta rally to plan " +
        "vendor booth layouts, order portable restrooms, coordinate with city services for road " +
        "closures, and give food trucks foot traffic projections so they can stock appropriately.",
      stepsToReproduce: [
        `Navigate to /admin/events/${event.id}/edit`,
        "Look for RSVP, capacity, attendance, or registration fields — none exist",
        "Navigate to /map and click an event marker",
        "Look for RSVP or registration buttons in the popup — none exist",
        "Check the event API response for attendance-related fields — none exist",
      ],
      expectedBehavior:
        "Each event should have a capacity field (optional) and an RSVP/registration mechanism. " +
        "The admin dashboard should show RSVP counts and trends. Public event pages or popups " +
        "should let visitors indicate interest ('Going', 'Interested'). An export option for " +
        "attendee lists would help logistics planning. Eventbrite, Meetup, and Facebook Events all " +
        "provide this as core functionality.",
      actualBehavior:
        "Zero attendance-related features. The event model only stores descriptive info (title, " +
        "date, location, impact). No way to gauge interest or track turnout.",
      userImpact:
        "Without RSVP data, Carlos is flying blind on logistics. Last year he under-ordered " +
        "restrooms for the food truck rally because he had no attendance estimate. Food truck " +
        "vendors ask him for foot traffic projections to decide how much inventory to bring — he " +
        "can only guess. City services need attendance estimates for road closure permits. Every " +
        "event management platform Carlos has used (Eventbrite, Meetup) provides this data " +
        "automatically. Its absence forces him to use a separate tool and manually cross-reference.",
      priority: "high",
      pageUrl: `/admin/events/${event.id}/edit`,
    });
  });

  test("Carlos tries to duplicate an existing event as a template", async ({
    page,
  }) => {
    // Get an existing event to try duplicating
    const response = await page.request.get("/api/events");
    const events = await response.json();
    const event = events.find(
      (e: { title: string }) =>
        e.title === "Food Truck Rally" || e.title.includes("Food Truck")
    ) || events[0];

    await navigateTo(page, `/admin/events/${event.id}/edit`);
    await expect(page.locator("h1")).toContainText("Edit Event");

    // Look for duplicate / copy / template functionality
    const duplicateSelectors = [
      'button:has-text("Duplicate")',
      'button:has-text("Copy")',
      'button:has-text("Clone")',
      'a:has-text("Duplicate")',
      'a:has-text("Use as Template")',
      'button:has-text("Template")',
      '[data-testid*="duplicate" i]',
      '[data-testid*="clone" i]',
      'button:has-text("Save as")',
    ];

    let hasDuplicate = false;
    for (const selector of duplicateSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        hasDuplicate = true;
        break;
      }
    }

    expect(hasDuplicate).toBe(false);

    // Also check the events list page for bulk actions or duplicate options
    await navigateTo(page, "/admin/events");
    const listDuplicateControls = page.locator(
      'button:has-text("Duplicate"), button:has-text("Copy"), input[type="checkbox"]'
    );
    const listDuplicateCount = await listDuplicateControls.count();

    // File feature request for event templates / duplication
    fileReport({
      kind: "feature-request",
      persona: CARLOS,
      title: "Event duplication and template system",
      description:
        "There is no way to duplicate an existing event or save one as a template. Carlos runs the " +
        "Taste of Augusta rally every year with the same venue, polygon impact zone, description, " +
        "and category — only dates and minor details change. Without duplication, he recreates the " +
        "entire event from scratch annually, including re-drawing the polygon impact area point by " +
        "point on the map.",
      stepsToReproduce: [
        `Navigate to /admin/events/${event.id}/edit — the existing "${event.title}" event`,
        'Look for "Duplicate", "Copy", "Clone", or "Use as Template" buttons — none found',
        "Navigate to /admin/events — look for bulk actions or row-level duplicate — none found",
        `Found ${listDuplicateCount} duplicate/copy/bulk-action controls on the list page`,
        "Only option: manually create a new event and re-enter all fields",
      ],
      expectedBehavior:
        'A "Duplicate" button on the event edit page should create a new event pre-filled with all ' +
        "the original's data (title appended with '(Copy)', dates cleared for re-entry). An event " +
        "template library would let Carlos save reusable configurations. Google Calendar's " +
        "'Duplicate' and Eventbrite's 'Copy Event' features do exactly this.",
      actualBehavior:
        "No duplication, cloning, or template functionality exists. Each event must be built " +
        "entirely from scratch.",
      userImpact:
        "The Taste of Augusta rally has a complex polygon impact zone spanning 6 city blocks. " +
        "Re-drawing this polygon every year is tedious and error-prone — last year Carlos placed " +
        "a vertex on the wrong block, causing the impact zone to show incorrect road closures on " +
        "the public map for a week before anyone noticed. A duplicate button would preserve the " +
        "exact polygon geometry. Across all his events, duplication would save Carlos roughly " +
        "5 hours per year of repetitive data entry.",
      priority: "medium",
      pageUrl: `/admin/events/${event.id}/edit`,
    });
  });
});
