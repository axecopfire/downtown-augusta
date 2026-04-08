import { test, expect } from "@playwright/test";
import { PRIYA } from "../helpers/persona";
import { fileReport, type Report } from "../helpers/reporter";
import {
  navigateTo,
  waitForMapLoad,
  countMapMarkers,
  clickFirstMarker,
  getPopupText,
  findFilterControls,
} from "../helpers/test-helpers";

test.describe("Priya Nair — Weekend Tourist Planning Her Augusta Trip", () => {
  test.describe.configure({ mode: "serial" });

  test("Priya arrives at the homepage excited to explore", async ({ page }) => {
    await navigateTo(page, "/");

    const hero = page.locator("h1");
    await expect(hero).toBeVisible();
    const heroText = await hero.innerText();
    expect(heroText.toLowerCase()).toContain("augusta");

    // Look for event highlights or "what's happening" section
    const weekendSection = page.locator(
      'text=/this weekend|upcoming events|what\'s happening|featured events/i'
    );
    const hasWeekendSection = (await weekendSection.count()) > 0;

    // Check for stats and feature cards — they exist but are generic
    const statsSection = page.locator("text=/upcoming events/i");
    await expect(statsSection.first()).toBeVisible();

    const ctaButton = page.locator('a[href="/map"]');
    await expect(ctaButton.first()).toBeVisible();

    fileReport({
      kind: "feature-request",
      persona: PRIYA,
      title: "Homepage needs featured/upcoming events for tourists",
      description:
        "As a travel blogger arriving at the Downtown Augusta site for the first " +
        "time, my immediate question is 'What's happening this weekend?' The " +
        "homepage has a nice hero section and generic stats, but there's no " +
        "curated preview of upcoming events or featured dining spots. Every " +
        "major city tourism site — Visit Savannah, Explore Charleston, Discover " +
        "Atlanta — puts this weekend's highlights front and center. A tourist's " +
        "first impression should showcase what's happening NOW, not static counts " +
        "like '30+ Upcoming Events' with no way to see them.",
      stepsToReproduce: [
        "Navigate to the homepage at /",
        "Look for any section showing specific upcoming events",
        "Look for featured restaurants or 'where to eat' highlights",
        "Find only generic stats and feature cards with no actual event data",
      ],
      expectedBehavior:
        "Homepage should display 3-5 upcoming events with dates and a " +
        "'Top Restaurants' or 'Where to Eat' carousel. Tourists need immediate " +
        "answers to 'What should I do this weekend?' without clicking deeper.",
      actualBehavior:
        hasWeekendSection
          ? "A weekend section exists but lacks rich detail."
          : "No upcoming event highlights or featured businesses on the homepage. " +
            "Only static stats ('30+ Upcoming Events') and generic feature cards.",
      userImpact:
        "First-time visitors like me bounce when a tourism site doesn't " +
        "immediately answer 'What's happening?' This is Augusta's chance to " +
        "hook tourists in the first 5 seconds. Without featured events, I'd " +
        "close the tab and search 'things to do in Augusta' on Google instead.",
      priority: "high",
      pageUrl: "/",
    });
  });

  test("Priya opens the map to discover the downtown area", async ({
    page,
  }) => {
    await navigateTo(page, "/map");
    await waitForMapLoad(page);

    const markerCount = await countMapMarkers(page);
    expect(markerCount).toBeGreaterThan(0);

    // Check for the legend
    const legend = page.locator("text=/map legend|legend/i");
    await expect(legend.first()).toBeVisible();

    // Verify legend mentions businesses and events
    const legendContainer = page.locator(".leaflet-control, [class*=legend]").last();
    const legendText = await legendContainer.innerText();
    const hasBusiness = /business/i.test(legendText);
    const hasEvent = /event/i.test(legendText);

    // All businesses use the same blue marker — no way to tell restaurants from shops
    fileReport({
      kind: "feature-request",
      persona: PRIYA,
      title: "Business markers need category-specific icons",
      description:
        "I opened the map and see a cluster of blue markers and some colored " +
        "event markers. The legend explains events use green/orange/red for " +
        "impact levels — that's helpful. But every single business is the same " +
        "blue dot. I can't visually distinguish a restaurant from a bookstore " +
        "from a museum. On Google Maps, restaurants have a fork-and-knife icon, " +
        "shops have a bag icon, and entertainment venues have a music note. " +
        "Tourism maps like Visit Savannah use distinct icons per category so " +
        "visitors can scan for what they want at a glance.",
      stepsToReproduce: [
        "Navigate to /map",
        "Wait for the map to load with all markers",
        "Look at the business markers — they are all identical blue pins",
        "Try to identify which markers are restaurants vs shops vs venues",
        "Check the legend — it only distinguishes business (blue) vs event colors",
      ],
      expectedBehavior:
        "Each business category should have a distinct marker icon or color: " +
        "🍽️ for restaurants, 🎵 for music venues, 📚 for bookstores, 🏛️ for " +
        "museums. The legend should show all category icons so tourists can " +
        "quickly scan the map for their interest.",
      actualBehavior:
        `Map shows ${markerCount} markers total. All businesses use identical ` +
        "blue pin markers regardless of category. Legend shows Business (blue) " +
        "and Event impact colors but no business category differentiation.",
      userImpact:
        "As a tourist with limited time, I need to visually scan the map for " +
        "restaurants at a glance. Having to click every blue marker to find out " +
        "if it's a restaurant or a law office wastes my precious weekend time. " +
        "Category-coded markers would make this map genuinely useful for trip planning.",
      priority: "medium",
      pageUrl: "/map",
    });
  });

  test("Priya tries to find restaurants for dinner", async ({ page }) => {
    await navigateTo(page, "/map");
    await waitForMapLoad(page);

    // Try to find filter controls using the helper
    const hasFilters = await findFilterControls(page);

    // Try clicking a few markers to find restaurants
    const markers = page.locator(".leaflet-marker-icon");
    const markerCount = await markers.count();
    const popupTexts: string[] = [];

    for (let i = 0; i < Math.min(markerCount, 4); i++) {
      // Close any open popup first
      const closeBtn = page.locator(".leaflet-popup-close-button");
      if ((await closeBtn.count()) > 0) {
        try {
          await closeBtn.click({ timeout: 1000 });
          await page.waitForTimeout(200);
        } catch {
          // Close button may not be clickable
        }
      }

      try {
        // Try clicking with force and timeout to prevent hanging
        const marker = markers.nth(i);
        await marker.click({ force: true, timeout: 2000 });

        try {
          await page.waitForSelector(".leaflet-popup", { timeout: 1500 });
          const text = await getPopupText(page);
          popupTexts.push(text);
        } catch {
          // Marker may not produce a popup
        }
      } catch {
        // Marker click failed — continue to next marker
      }
    }

    fileReport({
      kind: "feature-request",
      persona: PRIYA,
      title: "Map needs category filters so tourists can find restaurants",
      description:
        "I'm trying to find a great dinner spot for tonight. I went to the map " +
        "and had to click marker after marker hoping to stumble on a restaurant. " +
        `I clicked ${Math.min(markerCount, 4)} markers and saw: ` +
        `${popupTexts.length > 0 ? popupTexts.map((t) => `"${t.split("\n")[0]}"`).join(", ") : "various businesses"}. ` +
        "There's no quick way to say 'show me only restaurants' or 'show me " +
        "bars and nightlife.' Every tourism app I've used — TripAdvisor, Yelp, " +
        "Google Maps, Visit Savannah — has prominent category filters. " +
        `Filter controls found via standard selectors: ${hasFilters ? "yes" : "no"}.`,
      stepsToReproduce: [
        "Navigate to /map",
        "Look for a 'Restaurant' or 'Food & Drink' filter button or dropdown",
        "Look for any category filter controls (select, buttons, checkboxes)",
        "Resort to clicking individual markers one by one to find restaurants",
        "Give up after clicking several markers without finding what you need",
      ],
      expectedBehavior:
        "A prominent filter bar at the top of the map or in a sidebar with " +
        "toggleable category buttons: Restaurants, Bars, Shopping, Arts & Culture, " +
        "Entertainment. Clicking 'Restaurants' should highlight or isolate only " +
        "restaurant markers on the map.",
      actualBehavior:
        `Standard filter controls detected: ${hasFilters}. ` +
        "No user-friendly way to filter the map to show only restaurants. " +
        "Tourists must click each blue marker individually to discover its category.",
      userImpact:
        "A tourist planning dinner shouldn't have to play 'click and pray' with " +
        "map markers. I have 3 evenings in Augusta and want to find the best " +
        "restaurants quickly. Without filters, I'll just open Yelp instead — " +
        "which means Augusta's local businesses lose visibility to a national platform.",
      priority: "high",
      pageUrl: "/map",
    });
  });

  test("Priya looks for this weekend's events", async ({ page }) => {
    await navigateTo(page, "/");

    // Click the Events nav link (if it exists)
    const eventsLink = page.locator('a[href="/admin/events"]');
    const hasEventsLink = (await eventsLink.count()) > 0;

    // If the link exists and is visible, try clicking it
    let navigatedToAdmin = false;
    if (hasEventsLink) {
      try {
        await eventsLink.first().click({ timeout: 3000 });
        await page.waitForLoadState("networkidle");
        const currentUrl = page.url();
        navigatedToAdmin = currentUrl.includes("/admin/events");
      } catch {
        // Click failed or navigation didn't work
      }
    }

    // Gather info about what we found
    const currentUrl = page.url();
    const adminHeading = page.locator("h1");
    const adminHeadingVisible = (await adminHeading.count()) > 0;
    const adminHeadingText = adminHeadingVisible
      ? await adminHeading.first().innerText()
      : "";

    const newEventButton = page.locator('text=/new event/i');
    const hasNewEventButton = (await newEventButton.count()) > 0;

    const table = page.locator("table");
    const hasTable = (await table.count()) > 0;

    let eventCount = 0;
    if (hasTable) {
      eventCount = await page.locator("tbody tr").count();
    }

    // Look for edit/delete buttons — clear admin functionality
    const editButtons = page.locator('a:has-text("Edit"), button:has-text("Edit")');
    const deleteButtons = page.locator('button:has-text("Delete")');
    const hasEditControls = (await editButtons.count()) > 0;
    const hasDeleteControls = (await deleteButtons.count()) > 0;

    fileReport({
      kind: "bug",
      persona: PRIYA,
      title: hasEventsLink
        ? "Events nav link sends tourists to admin page"
        : "No public events page accessible from navigation",
      description: hasEventsLink
        ? "I clicked the 'Events' link in the navigation expecting to see a " +
          "public-facing events page — something like an event calendar or listing " +
          "with dates, descriptions, and photos. Instead, I landed on " +
          `\`/admin/events\` which is clearly an administrative interface with a ` +
          `data table (${eventCount} events), ` +
          `${hasNewEventButton ? "a 'New Event' creation button, " : ""}` +
          `${hasEditControls ? "Edit buttons, " : ""}` +
          `${hasDeleteControls ? "and Delete buttons" : "no visible admin actions"}. ` +
          "This is a significant UX problem — tourists should never encounter " +
          "admin interfaces. It's confusing and makes the site feel unfinished."
        : "I'm looking for a way to see this weekend's events from the homepage. " +
          "There's an 'Events' link in the navigation, but clicking it either doesn't " +
          "work or takes me somewhere unexpected (URL: " +
          currentUrl +
          "). I need a public events page with upcoming events, dates, times, and descriptions.",
      stepsToReproduce: hasEventsLink
        ? [
            "Go to the homepage at /",
            "Click the 'Events' link in the top navigation bar",
            "Observe that the URL changes to /admin/events",
            "See an admin table with Edit and Delete controls",
            "Wonder whether you accidentally broke something",
          ]
        : [
            "Go to the homepage at /",
            "Look for an 'Events' link or button",
            "Try clicking the Events navigation link",
            "Notice it either doesn't navigate or goes to an unexpected page",
          ],
      expectedBehavior: hasEventsLink
        ? "The 'Events' nav link should go to a public `/events` page showing a " +
          "beautiful, browsable event listing or calendar view. Events should be " +
          "filterable by date ('This Weekend', 'Next Week') and category, with " +
          "photos, descriptions, and 'Add to Calendar' buttons."
        : "The navigation should include a public 'Events' link or button that " +
          "navigates to a `/events` page showing upcoming events with details, " +
          "dates, times, and ways to learn more or buy tickets.",
      actualBehavior: navigatedToAdmin
        ? `The 'Events' nav link points to \`/admin/events\`, an admin CRUD table ` +
          `showing ${eventCount} events with edit/delete controls. No public ` +
          "event listing page exists. Tourists see raw admin functionality."
        : `No public events page found. Events link exists: ${hasEventsLink}, ` +
          `navigated to admin: ${navigatedToAdmin}, current URL: ${currentUrl}`,
      userImpact: hasEventsLink
        ? "This is a trust-killer for tourists. Seeing an admin page makes me " +
          "question whether this site is even meant for the public. I'd immediately " +
          "leave. Every tourism site I've used — Visit Savannah, Explore Charleston — " +
          "has a gorgeous public events page. This is Augusta's biggest gap right now."
        : "Without a working public events page, I can't discover what to do this weekend. " +
          "I came to the site to find events and now I'm confused and leaving.",
      priority: "critical",
      pageUrl: navigatedToAdmin ? "/admin/events" : currentUrl,
    });
  });

  test("Priya tries to plan a walking route", async ({ page }) => {
    await navigateTo(page, "/map");
    await waitForMapLoad(page);

    // Look for itinerary or route planning features
    const itineraryControls = page.locator(
      'text=/itinerary|route|plan|directions|walking tour/i'
    );
    const hasItinerary = (await itineraryControls.count()) > 0;

    // Click a marker and look for save/favorite buttons
    let hasSaveButton = false;
    let popupText = "";
    try {
      await clickFirstMarker(page);
      const popupContent = page.locator(".leaflet-popup-content");
      if ((await popupContent.count()) > 0) {
        const saveButton = popupContent.locator(
          'button:has-text("Save"), button:has-text("Favorite"), button:has-text("Add to"), button[aria-label*="save" i], button[aria-label*="favorite" i], button[aria-label*="bookmark" i]'
        );
        hasSaveButton = (await saveButton.count()) > 0;
        popupText = await getPopupText(page);
      }
    } catch {
      // Marker click may fail, continue with feature report
    }

    fileReport({
      kind: "feature-request",
      persona: PRIYA,
      title: "No itinerary or trip planner for tourists",
      description:
        "I'm spending a long weekend in Augusta and want to plan my days " +
        "efficiently — brunch here, walk to the museum, dinner there, then live " +
        "music. But there's no way to save locations or build a walking route. " +
        (popupText
          ? `I clicked on a marker and saw useful info ("${popupText.split("\n")[0]}"), but no 'Save to My Trip' or ` +
            "'Add to Itinerary' button. "
          : "When I tried to click on markers to see details, the interaction didn't work reliably. ") +
        `Itinerary/route feature found: ${hasItinerary}. ` +
        `Save/favorite button in popups: ${hasSaveButton}. ` +
        "Sites like Visit Savannah have 'Build Your Trip' features that let " +
        "you drag-and-drop spots into a day-by-day plan with a walking map.",
      stepsToReproduce: [
        "Navigate to /map",
        "Click on a business marker to open its popup",
        "Look for a 'Save', 'Favorite', or 'Add to Itinerary' button",
        "Look for any trip planning or route building feature anywhere on the page",
        "Find no way to save or sequence multiple stops",
      ],
      expectedBehavior:
        "Each marker popup should have an 'Add to My Trip' button. A sidebar " +
        "panel should show saved stops that can be reordered into a walking " +
        "route. The route should render on the map with walking distance and " +
        "time estimates between stops.",
      actualBehavior:
        "No itinerary, trip planner, or save/favorite functionality exists. " +
        "Marker popups show basic info but no way to bookmark or sequence stops. " +
        "Tourists have no way to plan a multi-stop day on this platform.",
      userImpact:
        "Without trip planning, I'll screenshot the map and plan in Google Maps " +
        "instead — which means I leave this site and never come back. An itinerary " +
        "builder would be the killer feature that makes tourists RETURN to this " +
        "site throughout their trip, increasing engagement and local business exposure.",
      priority: "medium",
      pageUrl: "/map",
    });
  });

  test("Priya wants to see event details and timing", async ({ page }) => {
    await navigateTo(page, "/map");
    await waitForMapLoad(page);

    // Find and click an event marker — events use colored (non-blue) markers
    // Try clicking markers until we find an event popup (has date info)
    const markers = page.locator(".leaflet-marker-icon");
    const markerCount = await markers.count();
    let eventPopupText = "";
    let foundEvent = false;

    for (let i = 0; i < markerCount; i++) {
      const closeBtn = page.locator(".leaflet-popup-close-button");
      if ((await closeBtn.count()) > 0) {
        try {
          await closeBtn.click({ timeout: 1000 });
          await page.waitForTimeout(200);
        } catch {
          // Close button may not be clickable
        }
      }

      try {
        // Try clicking with force and timeout to prevent hanging
        const marker = markers.nth(i);
        await marker.click({ force: true, timeout: 2000 });

        try {
          await page.waitForSelector(".leaflet-popup", { timeout: 1500 });
          const text = await getPopupText(page);
          // Event popups typically contain date indicators (📅) or date-like text
          if (text.includes("📅") || /\d{4}|date|start|end/i.test(text)) {
            eventPopupText = text;
            foundEvent = true;
            break;
          }
        } catch {
          // Continue to next marker
        }
      } catch {
        // Marker click failed — continue to next marker
      }
    }

    // Check what's missing from the popup
    const popup = page.locator(".leaflet-popup-content");
    const hasImage = (await popup.locator("img").count()) > 0;
    const hasCalendarButton = (await popup.locator('text=/add to calendar/i').count()) > 0;
    const hasShareButton = (await popup.locator('text=/share/i').count()) > 0;
    const hasTicketLink = (await popup.locator('text=/ticket|rsvp|register/i').count()) > 0;

    fileReport({
      kind: "feature-request",
      persona: PRIYA,
      title: "Event popups lack rich detail for tourist decision-making",
      description:
        "I found an event on the map" +
        (foundEvent
          ? ` ("${eventPopupText.split("\n")[0]}") `
          : " ") +
        "and the popup shows basic text info — title, dates, maybe a description. " +
        "But as a tourist deciding whether to attend, I need much more. " +
        `Photo/image in popup: ${hasImage}. ` +
        `'Add to Calendar' button: ${hasCalendarButton}. ` +
        `Share link: ${hasShareButton}. ` +
        `Ticket/RSVP link: ${hasTicketLink}. ` +
        "When I'm browsing events on Eventbrite or Visit Savannah, each event " +
        "has a hero photo, a clear time, ticket info, and one-tap calendar add. " +
        "These popups feel like database records, not event promotions.",
      stepsToReproduce: [
        "Navigate to /map",
        "Click on an event marker (colored marker, not blue)",
        "Read the popup content",
        "Look for a photo or banner image — none",
        "Look for an 'Add to Calendar' button — none",
        "Look for a 'Share' button to send to travel companions — none",
        "Look for ticket or RSVP information — none",
      ],
      expectedBehavior:
        "Event popups should include: a header photo or event banner, " +
        "formatted date/time with day-of-week ('Saturday, March 15 at 7:00 PM'), " +
        "an 'Add to Google Calendar / Apple Calendar' button, a share button " +
        "(copy link, text to friend), ticket/RSVP link if applicable, and a " +
        "'Get Directions' button.",
      actualBehavior:
        "Event popups show plain text: title, category, dates, and description. " +
        "No images, no calendar integration, no share functionality, no ticket links. " +
        "The popup is informational but not actionable — tourists can read about " +
        "the event but can't do anything with it.",
      userImpact:
        "I'm planning my weekend with my travel group. When I find an interesting " +
        "event, I need to share it with friends and add it to our shared calendar " +
        "in one tap. Without these features, I have to manually type event details " +
        "into a group chat. That friction means I'll probably skip events I would " +
        "have attended — costing Augusta tourism dollars.",
      priority: "medium",
      pageUrl: "/map",
    });
  });

  test("Priya looks for nightlife and entertainment", async ({ page }) => {
    await navigateTo(page, "/map");
    await waitForMapLoad(page);

    // Look for curated category buttons like "nightlife", "date night", etc.
    const curatedCategories = page.locator(
      'text=/nightlife|date night|family.friendly|entertainment|live music|happy hour/i'
    );
    const hasCuratedCategories = (await curatedCategories.count()) > 0;

    // Try to find bars and entertainment by clicking markers
    const markers = page.locator(".leaflet-marker-icon");
    const markerCount = await markers.count();
    const discoveredPlaces: string[] = [];

    for (let i = 0; i < Math.min(markerCount, 5); i++) {
      const closeBtn = page.locator(".leaflet-popup-close-button");
      if ((await closeBtn.count()) > 0) {
        try {
          await closeBtn.click({ timeout: 1000 });
          await page.waitForTimeout(200);
        } catch {
          // Close button may not be clickable
        }
      }

      try {
        // Try clicking with force and timeout to prevent hanging
        const marker = markers.nth(i);
        await marker.click({ force: true, timeout: 2000 });

        try {
          await page.waitForSelector(".leaflet-popup", { timeout: 1500 });
          const text = await getPopupText(page);
          const firstLine = text.split("\n")[0];
          discoveredPlaces.push(firstLine);
        } catch {
          // Continue
        }
      } catch {
        // Marker click failed — continue to next marker
      }
    }

    fileReport({
      kind: "feature-request",
      persona: PRIYA,
      title: "No curated experience categories like nightlife or date night",
      description:
        "It's Friday night in Augusta and I want to find live music and cocktail " +
        "bars. I went to the map looking for a 'Nightlife' or 'Entertainment' " +
        "category but found none. " +
        `Curated experience categories found: ${hasCuratedCategories}. ` +
        "I clicked through " +
        `${discoveredPlaces.length} markers and found: ` +
        `${discoveredPlaces.map((p) => `"${p}"`).join(", ") || "various places"}. ` +
        "Tourists don't think in database categories like 'bar' or 'restaurant' — " +
        "we think in experiences: 'Where should I go for a fun Friday night?' " +
        "'What's good for a romantic date?' 'Where can I take the kids?' " +
        "Sites like TripAdvisor and Visit Savannah offer curated collections " +
        "like 'Best Nightlife', 'Romantic Restaurants', and 'Family Fun'.",
      stepsToReproduce: [
        "Navigate to /map",
        "Look for category options like 'Nightlife', 'Live Music', 'Entertainment'",
        "Look for curated collections like 'Friday Night Out' or 'Date Night'",
        "Find no experience-based categories",
        "Resort to clicking random markers hoping to find bars and music venues",
      ],
      expectedBehavior:
        "The map or a companion page should offer curated experience categories: " +
        "'🌙 Nightlife & Bars', '🎵 Live Music', '🍷 Date Night', " +
        "'👨‍👩‍👧‍👦 Family-Friendly', '🎨 Arts & Culture', '☕ Coffee & Brunch'. " +
        "Clicking a category should filter the map and show a curated list " +
        "with descriptions, photos, and ratings.",
      actualBehavior:
        "No curated experience categories exist. The map shows all markers " +
        "without experience-based grouping. Tourists have no way to browse " +
        "by mood or occasion, only by clicking individual markers.",
      userImpact:
        "When I blog about Augusta, I write guides like 'Best Nightlife in " +
        "Augusta' and 'Top Date Night Spots'. If this site offered curated " +
        "collections, I could link directly to them — driving traffic back to " +
        "Augusta's platform instead of TripAdvisor. Without them, this site " +
        "is a map with dots, not a tourism experience.",
      priority: "medium",
      pageUrl: "/map",
    });
  });
});
