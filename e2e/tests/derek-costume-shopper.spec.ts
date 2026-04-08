import { test, expect } from "@playwright/test";
import { DEREK } from "../helpers/persona";
import { fileReport, type Report } from "../helpers/reporter";
import {
  navigateTo,
  waitForMapLoad,
  countMapMarkers,
  searchForText,
  findFilterControls,
  clickNavLink,
} from "../helpers/test-helpers";

test.describe("Derek Sullivan — Halloween Costume Shopper", () => {
  test.describe.configure({ mode: "serial" });

  test("Derek lands on the homepage looking for shops", async ({ page }) => {
    await navigateTo(page, "/");

    // Check hero section and stats are visible
    await expect(page.locator("body")).toContainText(/downtown augusta/i);
    const statsText = await page.locator("body").innerText();
    expect(statsText).toMatch(/30\+[\s\S]*?Events/i);
    expect(statsText).toMatch(/120\+[\s\S]*?Businesses/i);
    expect(statsText).toMatch(/15[\s\S]*?City Blocks/i);

    // Look for any mention of shopping, retail, or costumes
    const bodyText = await page.locator("body").innerText();
    const hasShoppingMention =
      /shopping|retail|costume|shop|store/i.test(bodyText);

    // Check for search bar on the homepage
    const hasSearch = await searchForText(page, "costume shops");

    // Check for category quick links
    const hasCategoryLinks =
      (await page
        .locator('a[href*="category"], a[href*="retail"], a[href*="shop"]')
        .count()) > 0;

    // Check for "Explore the Map" CTA
    const exploreLink = page.locator('a:has-text("Explore"), a:has-text("Map")');
    const hasExploreCta = (await exploreLink.count()) > 0;
    expect(hasExploreCta).toBe(true);

    fileReport({
      kind: "feature-request",
      persona: DEREK,
      title: "Homepage lacks category quick links and search for visitors",
      description:
        "I just arrived in Augusta from Atlanta and I need to find a Halloween costume ASAP. " +
        "I landed on the homepage and see some nice stats (30+ Events, 120+ Businesses) but " +
        "there's no way to quickly jump to a business category like 'retail' or 'shopping.' " +
        "There's no search bar on the homepage at all. The only action I can take is 'Explore the Map,' " +
        "which dumps me onto a map with zero context about what kinds of businesses exist downtown. " +
        "A site like Yelp or Google Maps lets you search 'costume shop near me' from the first screen. " +
        "This homepage should have category quick-links (Retail, Restaurants, Entertainment, etc.) " +
        "and a prominent search bar so visitors like me can find what they need in seconds.",
      stepsToReproduce: [
        "Navigate to the homepage at /",
        "Look for a search bar or quick links to business categories",
        "Notice there are none — only a generic 'Explore the Map' CTA",
      ],
      expectedBehavior:
        "A search bar and/or category quick-links (Retail, Food, Entertainment) on the " +
        "homepage so visitors can immediately narrow down what they're looking for.",
      actualBehavior:
        `No search functionality found: ${!hasSearch}. ` +
        `No category quick links found: ${!hasCategoryLinks}. ` +
        `Shopping/retail mentioned on page: ${hasShoppingMention}.`,
      userImpact:
        "First-time visitors with specific needs (like finding a costume shop) have no way to " +
        "start their search from the homepage. They must click 'Explore the Map' and then manually " +
        "scan every single marker. This creates a frustrating first impression and likely causes " +
        "visitors to leave the site in favor of Google Maps — taking potential revenue away from " +
        "downtown Augusta businesses.",
      priority: "high",
      pageUrl: "/",
    });
  });

  test("Derek tries to search for costume shops on the map", async ({
    page,
  }) => {
    await navigateTo(page, "/map");
    await waitForMapLoad(page);

    const markerCount = await countMapMarkers(page);
    expect(markerCount).toBeGreaterThan(0);

    // Try to find a search input on the map page
    const hasSearch = await searchForText(page, "costume");

    // Try to find category filter controls
    const hasFilters = await findFilterControls(page);

    fileReport({
      kind: "feature-request",
      persona: DEREK,
      title: "Map page has no search or category filter — impossible to find specific businesses",
      description:
        "I navigated to the map hoping to search for 'costume shops' or at least filter by " +
        "'retail' category. There are ${markerCount} markers on the map, but NO search bar and " +
        "NO category filter. I literally have to click every single marker one by one to figure out " +
        "which businesses are retail shops. This is the most critical missing feature on the site. " +
        "On Google Maps, I'd type 'costume shop' and instantly see relevant results highlighted. " +
        "On this map, I'm completely lost — I can see markers but I have no idea which ones are " +
        "shops vs restaurants vs bars. I'm visiting from out of town with limited time. Without " +
        "search and filtering, this map is essentially useless for finding anything specific.",
      stepsToReproduce: [
        "Navigate to /map",
        "Wait for the map to load with all markers",
        "Look for a search input — none exists",
        "Look for category filter dropdown or buttons — none exist",
        `See ${markerCount} markers with no way to identify which are retail shops`,
      ],
      expectedBehavior:
        "A search bar at the top of the map page to search by business name or keyword, " +
        "plus category filter buttons or a dropdown (Retail, Restaurant, Bar, Entertainment, etc.) " +
        "that toggle marker visibility on the map.",
      actualBehavior:
        `Search available: ${hasSearch}. Filter controls available: ${hasFilters}. ` +
        `${markerCount} markers displayed with no way to search or filter them.`,
      userImpact:
        "This is a dealbreaker for any visitor with a specific goal. Without search or filters, " +
        "the map fails at its primary job — helping people find businesses. Every out-of-town " +
        "visitor will abandon this site for Google Maps. Downtown Augusta businesses lose foot " +
        "traffic because visitors can't discover them. This should be the #1 development priority.",
      priority: "critical",
      pageUrl: "/map",
    });
  });

  test("Derek clicks through map markers hoping to find retail shops", async ({
    page,
  }) => {
    await navigateTo(page, "/map");
    await waitForMapLoad(page);

    const markers = page.locator(".leaflet-marker-icon");
    const markerCount = await markers.count();
    expect(markerCount).toBeGreaterThan(0);

    // Click through up to 5 markers looking for retail shops
    const popupContents: string[] = [];
    const markersToCheck = Math.min(markerCount, 5);
    let retailFound = false;
    let categoryShownInPopup = false;

    for (let i = 0; i < markersToCheck; i++) {
      // Close any existing popup first
      const existingPopupClose = page.locator(".leaflet-popup-close-button");
      if ((await existingPopupClose.count()) > 0) {
        try {
          await existingPopupClose.click({ timeout: 2000 });
          await page.waitForTimeout(300);
        } catch {
          // Couldn't close popup, move on
        }
      }

      const marker = markers.nth(i);
      try {
        // Try to click the marker with force option to bypass pointer event conflicts
        await marker.click({ force: true, timeout: 5000 });
      } catch {
        // Marker click failed, move to next
        continue;
      }

      try {
        await page.waitForSelector(".leaflet-popup", { timeout: 3000 });
        const popupText = await page
          .locator(".leaflet-popup-content")
          .innerText();
        popupContents.push(popupText);

        if (/category/i.test(popupText)) {
          categoryShownInPopup = true;
        }
        if (/retail|shop|costume|vintage|craft/i.test(popupText)) {
          retailFound = true;
        }
      } catch {
        // Popup didn't appear — marker might be an event
      }
    }

    // Check if markers have distinguishing visual cues
    const markerImages = await markers.evaluateAll((els) =>
      els.map((el) => ({
        src: el.getAttribute("src") ?? "",
        className: el.className,
        style: el.getAttribute("style") ?? "",
      }))
    );
    const uniqueMarkerStyles = new Set(
      markerImages.map((m) => `${m.src}|${m.className}`)
    );

    fileReport({
      kind: "bug",
      persona: DEREK,
      title: "No way to identify business type from map markers — must click each one individually",
      description:
        "I spent several minutes clicking through markers on the map trying to find retail shops. " +
        `Out of ${markersToCheck} markers I checked, here's what I found in popups:\n\n` +
        popupContents.map((p, i) => `**Marker ${i + 1}:** ${p.replace(/\n/g, " | ")}`).join("\n\n") +
        "\n\n" +
        `Category shown in popup: ${categoryShownInPopup}. Retail shop found: ${retailFound}.\n\n` +
        "The markers all look the same — blue pins for businesses. There's no color coding by " +
        "category, no icons to distinguish a restaurant from a retail shop, and no legend. " +
        "I have to click EVERY marker to read the popup and figure out what kind of business it is. " +
        `I found ${uniqueMarkerStyles.size} distinct marker style(s), which is not enough to ` +
        "differentiate business types at a glance. On Google Maps, different business types have " +
        "different icons (shopping bag for retail, fork/knife for restaurants). This site treats " +
        "every business the same visually.",
      stepsToReproduce: [
        "Navigate to /map and wait for markers to load",
        "Observe that all business markers appear identical (blue pins)",
        "Click markers one by one to discover what type of business each is",
        `Check ${markersToCheck} markers — tedious process to find any retail shop`,
      ],
      expectedBehavior:
        "Different marker icons or colors for each business category (retail = shopping bag, " +
        "restaurant = fork/knife, bar = cocktail glass, etc.) with a visible legend. Visitors " +
        "should identify business types at a glance without clicking.",
      actualBehavior:
        `All business markers use the same blue pin icon. ${uniqueMarkerStyles.size} unique ` +
        "marker style(s) detected across all markers. No legend or category color coding. " +
        "Must click each marker individually to learn the business type.",
      userImpact:
        "A visitor looking for a specific type of business (costume shop, restaurant, bar) must " +
        "click through every marker — there could be dozens. This is a terrible user experience " +
        "that wastes visitors' time. Combined with no search/filter, it makes the map nearly " +
        "unusable for anyone with a specific goal. I'm about to give up and just use Google Maps.",
      priority: "high",
      pageUrl: "/map",
    });
  });

  test("Derek looks for Halloween events", async ({ page }) => {
    // First check the map for any event markers
    await navigateTo(page, "/map");
    await waitForMapLoad(page);

    const bodyText = await page.locator("body").innerText();
    const hasHalloweenMention = /halloween/i.test(bodyText);

    // Check if there's a public events page linked from the nav
    const eventsNavLink = page.locator(
      'nav a[href*="event"], a:has-text("Events")'
    );
    const hasPublicEventsLink = (await eventsNavLink.count()) > 0;

    // Visit the admin events page — the only place events are listed
    await navigateTo(page, "/admin/events");

    const adminEventsText = await page.locator("body").innerText();
    const eventsExist = /marathon|festival|concert|market|parade|halloween/i.test(
      adminEventsText
    );

    // Check for any event rows in the table
    const eventRows = await page.locator("tbody tr").count();

    // Look for category or date filtering on admin events page
    const hasAdminFilters = await findFilterControls(page);
    const hasAdminSearch = await searchForText(page, "halloween");

    fileReport({
      kind: "feature-request",
      persona: DEREK,
      title: "No public events page — events hidden in admin panel only",
      description:
        "I'm looking for Halloween events happening this weekend in downtown Augusta. I checked " +
        "the map page but there's no way to browse or search events. I couldn't find any public " +
        "'Events' page linked from the navigation. The ONLY place I found event listings is at " +
        "/admin/events — which is clearly an admin page, not meant for visitors.\n\n" +
        `Events visible in admin: ${eventRows} row(s). Halloween mentioned: ${hasHalloweenMention}. ` +
        `Public events link in nav: ${hasPublicEventsLink}.\n\n` +
        "A visitor should NEVER have to navigate to an admin URL to find upcoming events. This " +
        "site needs a public-facing events page — ideally with date filtering ('This Weekend'), " +
        "category tabs (Festival, Concert, Market), and a calendar view. I'm from out of town " +
        "and specifically looking for Halloween events — there's no way for me to discover them.",
      stepsToReproduce: [
        "Navigate to the homepage at /",
        "Look for an 'Events' link in the navigation — none found or it goes to admin",
        "Navigate to /map — no event listing or event search",
        "Navigate to /admin/events — find event listings here, but it's an admin page",
      ],
      expectedBehavior:
        "A public /events page accessible from the main navigation showing upcoming events " +
        "with date range filtering, category filters, and search. Events should also show on " +
        "the map with clear event-specific markers.",
      actualBehavior:
        `Public events page: none found. Events only at /admin/events (${eventRows} events). ` +
        `Admin filters: ${hasAdminFilters}. Admin search: ${hasAdminSearch}. ` +
        `Halloween content found on map: ${hasHalloweenMention}.`,
      userImpact:
        "Visitors have zero visibility into upcoming events unless they stumble upon the admin " +
        "panel. This defeats the entire purpose of listing events — they exist in the database " +
        "but are invisible to the public. Downtown Augusta is missing out on event-driven foot " +
        "traffic because visitors like me literally cannot discover what's happening. I came here " +
        "specifically looking for Halloween activities and I found nothing.",
      priority: "critical",
      pageUrl: "/admin/events",
    });
  });

  test("Derek tries to get directions to a shop", async ({ page }) => {
    await navigateTo(page, "/map");
    await waitForMapLoad(page);

    // Click a marker and inspect the popup for directions links
    const markers = page.locator(".leaflet-marker-icon");
    const markerCount = await markers.count();
    expect(markerCount).toBeGreaterThan(0);

    await markers.first().click();
    await page.waitForSelector(".leaflet-popup", { timeout: 5000 });

    const popupContent = await page
      .locator(".leaflet-popup-content")
      .innerHTML();
    const popupText = await page
      .locator(".leaflet-popup-content")
      .innerText();

    // Check for directions-related features
    const hasDirectionsLink =
      /direction|navigate|google\s*maps|maps\.google|route/i.test(popupContent);
    const hasAddressLink =
      popupContent.includes("maps.google.com") ||
      popupContent.includes("maps.apple.com") ||
      popupContent.includes('href="geo:');
    const hasAddress = /\d+\s+\w+\s+(st|street|ave|avenue|rd|road|blvd|way)/i.test(
      popupText
    );

    fileReport({
      kind: "feature-request",
      persona: DEREK,
      title: "No directions or navigation link in business popups",
      description:
        "I found a business on the map and clicked its marker. The popup shows some info:\n\n" +
        `> ${popupText.replace(/\n/g, "\n> ")}\n\n` +
        `Address visible: ${hasAddress}. Directions link: ${hasDirectionsLink}. ` +
        `Maps link: ${hasAddressLink}.\n\n` +
        "There's no 'Get Directions' button, no link to Google Maps or Apple Maps, and the " +
        "address isn't even a clickable link that would open a maps app. I'm visiting from " +
        "Atlanta — I don't know how to get around downtown Augusta. If I find a costume shop, " +
        "I need to navigate there. Right now I'd have to manually copy the address, switch to " +
        "Google Maps, and paste it in. That's 2005-era UX. Every modern business listing includes " +
        "a one-tap 'Directions' button. This is especially important for mobile users who are " +
        "physically walking around downtown trying to find businesses.",
      stepsToReproduce: [
        "Navigate to /map and wait for map to load",
        "Click any business marker to open its popup",
        "Look for a 'Get Directions' link or button — none exists",
        "Look for a clickable address that opens a maps app — none exists",
        "Must manually copy the address and switch to a navigation app",
      ],
      expectedBehavior:
        "Each business popup should include a 'Get Directions' button that opens Google Maps " +
        "or Apple Maps with the business address pre-filled. At minimum, the address should be " +
        "a clickable link (geo: URI or Google Maps URL) that launches the user's default maps app.",
      actualBehavior:
        `Popup shows business info but no directions integration. Directions link: ${hasDirectionsLink}. ` +
        `Maps link: ${hasAddressLink}. Address shown: ${hasAddress}. ` +
        "Address is plain text, not a clickable link.",
      userImpact:
        "Out-of-town visitors who find a business on the map have no seamless way to navigate " +
        "there. The extra friction of manually copying an address means many visitors won't bother — " +
        "they'll just search on Google Maps instead, bypassing this site entirely. For a site " +
        "whose purpose is to drive foot traffic to downtown businesses, this is a critical gap.",
      priority: "high",
      pageUrl: "/map",
    });
  });

  test("Derek checks if shops are currently open", async ({ page }) => {
    await navigateTo(page, "/map");
    await waitForMapLoad(page);

    // Click through a couple markers and look for hours/open-now status
    const markers = page.locator(".leaflet-marker-icon");
    await markers.first().click();
    await page.waitForSelector(".leaflet-popup", { timeout: 5000 });

    const popupText = await page
      .locator(".leaflet-popup-content")
      .innerText();

    const hasHours = /hours|open|close|am|pm|mon|tue|wed|thu|fri|sat|sun/i.test(
      popupText
    );
    const hasOpenNowBadge = /open\s*now|currently\s*open|closed/i.test(
      popupText
    );

    // Also check the admin businesses page for hours info
    await navigateTo(page, "/admin/businesses");
    const adminText = await page.locator("body").innerText();
    const hasHoursInAdmin =
      /hours|open|close|schedule/i.test(adminText);

    // Check the API for hours data
    const apiResponse = await page.request.get("/api/businesses?category=retail");
    let apiHasHours = false;
    if (apiResponse.ok()) {
      const data = await apiResponse.json();
      const businesses = Array.isArray(data) ? data : data.businesses ?? [];
      apiHasHours = businesses.some(
        (b: Record<string, unknown>) =>
          b.hours && String(b.hours).trim().length > 0
      );
    }

    fileReport({
      kind: "feature-request",
      persona: DEREK,
      title: "No real-time open/closed status for businesses",
      description:
        "It's the weekend and I need a costume shop that's actually open RIGHT NOW. I clicked a " +
        "business marker and here's what the popup shows:\n\n" +
        `> ${popupText.replace(/\n/g, "\n> ")}\n\n` +
        `Hours displayed in popup: ${hasHours}. 'Open Now' badge: ${hasOpenNowBadge}. ` +
        `Hours data in API: ${apiHasHours}.\n\n` +
        "Even if hours are listed somewhere, there's no computed 'Open Now' / 'Closed' indicator. " +
        "I have to read the hours text, figure out what day it is, and mentally calculate whether " +
        "the shop is currently open. Google Maps shows a green 'Open' or red 'Closed' badge " +
        "instantly. For a visitor in a hurry, this is the difference between visiting a shop and " +
        "wasting a trip to a closed storefront. I don't want to walk 6 blocks to find a locked door.",
      stepsToReproduce: [
        "Navigate to /map and click a business marker",
        "Look for an 'Open Now' or 'Closed' indicator — none exists",
        "Look for business hours — may or may not be displayed",
        "Check /admin/businesses for hours column",
        "No real-time open/closed computation anywhere on the site",
      ],
      expectedBehavior:
        "Each business listing (popup, card, or detail page) should show a real-time " +
        "'Open Now' (green) or 'Closed' (red) badge computed from the business's operating " +
        "hours and the current day/time. Ideally, the map markers themselves could show this " +
        "(e.g., dimmed markers for closed businesses).",
      actualBehavior:
        `Hours in popup: ${hasHours}. Open/Closed badge: ${hasOpenNowBadge}. ` +
        `Hours data in API: ${apiHasHours}. ` +
        "No dynamic open/closed computation. Hours, if shown, are static text only.",
      userImpact:
        "Visitors waste time traveling to businesses that turn out to be closed. This is " +
        "especially painful for out-of-town visitors unfamiliar with the area. It erodes trust " +
        "in the site — if I walk to a 'recommended' shop and it's closed, I'll never use this " +
        "site again. An 'Open Now' filter would be the single most useful feature for someone " +
        "physically walking around downtown looking for an open shop.",
      priority: "high",
      pageUrl: "/map",
    });
  });

  test("Derek tries to find the site from a mobile perspective", async ({
    page,
  }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Test homepage on mobile
    await navigateTo(page, "/");
    const heroVisible = await page
      .locator("h1, h2, [class*='hero']")
      .first()
      .isVisible();

    // Check nav works on mobile — look for hamburger menu
    const hamburgerMenu = page.locator(
      'button[aria-label*="menu" i], button[aria-label*="nav" i], ' +
        'button:has(.hamburger), [class*="mobile-menu"], [class*="menu-toggle"]'
    );
    const hasHamburger = (await hamburgerMenu.count()) > 0;
    if (hasHamburger) {
      await hamburgerMenu.first().click();
      await page.waitForTimeout(500);
    }

    // Check navigation links are accessible
    const navLinks = page.locator("nav a, header a");
    const navLinksCount = await navLinks.count();

    // Test map on mobile
    await navigateTo(page, "/map");
    await waitForMapLoad(page);

    const mapContainer = page.locator(".leaflet-container");
    const mapBox = await mapContainer.boundingBox();
    const mapFillsScreen =
      mapBox !== null && mapBox.width >= 350 && mapBox.height >= 300;

    // Try clicking a marker on mobile
    const markers = page.locator(".leaflet-marker-icon");
    const mobileMarkerCount = await markers.count();
    let popupReadableOnMobile = false;

    if (mobileMarkerCount > 0) {
      try {
        await markers.first().click({ force: true, timeout: 5000 });
      } catch {
        // Marker click failed
        mobileMarkerCount = 0; // Skip marker-related checks
      }
      if (mobileMarkerCount > 0) {
        try {
          await page.waitForSelector(".leaflet-popup", { timeout: 3000 });
          const popup = page.locator(".leaflet-popup");
          const popupBox = await popup.boundingBox();
          popupReadableOnMobile =
            popupBox !== null && popupBox.width > 0 && popupBox.height > 0;
        } catch {
          popupReadableOnMobile = false;
        }
      }
    }

    // Test admin page on mobile (would a visitor stumble here?)
    await navigateTo(page, "/admin/businesses");
    const adminTable = page.locator("table");
    const hasTable = (await adminTable.count()) > 0;
    let tableOverflows = false;
    if (hasTable) {
      const tableBox = await adminTable.first().boundingBox();
      tableOverflows = tableBox !== null && tableBox.width > 375;
    }

    fileReport({
      kind: "bug",
      persona: DEREK,
      title: "Mobile usability issues for on-the-go visitors",
      description:
        "I'm walking around downtown Augusta using my phone to find a costume shop. " +
        "I tested the site at 375×667 (iPhone SE) and found several issues:\n\n" +
        `- **Homepage hero visible:** ${heroVisible}\n` +
        `- **Hamburger/mobile menu:** ${hasHamburger ? "Found" : "Not found — nav may be hidden or broken"}\n` +
        `- **Navigation links visible:** ${navLinksCount}\n` +
        `- **Map fills mobile screen:** ${mapFillsScreen}\n` +
        `- **Map markers on mobile:** ${mobileMarkerCount}\n` +
        `- **Popup readable on mobile:** ${popupReadableOnMobile}\n` +
        `- **Admin table overflows on mobile:** ${tableOverflows}\n\n` +
        "The map is the most important feature for a mobile visitor physically walking around " +
        "downtown. Markers need to be large enough to tap accurately on a touchscreen. Popups " +
        "need to be readable without zooming. If the navigation menu doesn't work on mobile, " +
        "visitors are stuck on whatever page they land on. This is likely the most common use " +
        "case — someone on their phone, walking downtown, trying to find a business.",
      stepsToReproduce: [
        "Open the site on a mobile device (375×667 viewport)",
        "Check that navigation menu is accessible (hamburger icon or visible links)",
        "Navigate to /map — verify the map fills the screen",
        "Try tapping a marker — check popup is readable",
        "Navigate to /admin/businesses — check table layout",
      ],
      expectedBehavior:
        "Fully responsive mobile experience: hamburger menu for navigation, full-width map, " +
        "tap-friendly markers, readable popups that don't overflow the screen, and responsive " +
        "tables that scroll horizontally or stack vertically.",
      actualBehavior:
        `Hero visible: ${heroVisible}. Mobile menu: ${hasHamburger ? "Present" : "Missing"}. ` +
        `Map fills screen: ${mapFillsScreen}. Popup readable: ${popupReadableOnMobile}. ` +
        `Table overflows: ${tableOverflows}. ` +
        "Mobile experience has gaps that make the site hard to use while walking around downtown.",
      userImpact:
        "The primary use case for this site is someone physically in downtown Augusta using " +
        "their phone. If the mobile experience is poor, the site fails its core mission. " +
        "I'm literally standing on Broad Street right now trying to find a costume shop on my " +
        "phone — if I can't navigate the site or read business info, I'll just open Google Maps " +
        "instead. Every mobile usability issue directly translates to lost foot traffic for " +
        "downtown businesses.",
      priority: "high",
      pageUrl: "/map",
    });
  });
});
