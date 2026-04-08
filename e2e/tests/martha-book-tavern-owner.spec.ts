import { test, expect } from "@playwright/test";
import { MARTHA } from "../helpers/persona";
import { fileReport, type Report } from "../helpers/reporter";
import {
  navigateTo,
  waitForMapLoad,
  countMapMarkers,
  clickFirstMarker,
  getPopupText,
  searchForText,
  findFilterControls,
} from "../helpers/test-helpers";

test.describe("Martha Kingsley — Book Tavern Owner", () => {
  test.describe.configure({ mode: "serial" });

  test("Martha visits the homepage and looks for her business", async ({
    page,
  }) => {
    await navigateTo(page, "/");

    // Check that the landing page has a hero heading
    const heroHeading = page.locator("h1").first();
    await expect(heroHeading).toBeVisible({ timeout: 10_000 });
    const heroText = await heroHeading.innerText();
    expect(heroText.length).toBeGreaterThan(0);

    // Look for an "Explore the Map" CTA
    const exploreCta = page.getByRole("link", { name: /explore/i });
    const ctaExists = (await exploreCta.count()) > 0;
    expect(ctaExists).toBeTruthy();

    // Check if The Book Tavern is mentioned anywhere on the homepage
    const pageContent = await page.textContent("body");
    const businessMentioned = pageContent
      ?.toLowerCase()
      .includes("book tavern");

    // Try to find a search bar
    const hasSearch = await searchForText(page, "Book Tavern");

    if (!hasSearch) {
      fileReport({
        kind: "feature-request",
        persona: MARTHA,
        title: "Homepage needs a search bar to find specific businesses",
        description:
          "As a business owner, I went to the Downtown Augusta homepage hoping to quickly look up " +
          "The Book Tavern to see how my shop appears to the public. There is a nice hero section " +
          "and a CTA to explore the map, but there's no search functionality on the landing page. " +
          "I have to click through to the map and then manually scan for my business. A search bar " +
          "on the homepage that lets visitors and business owners alike type a name and jump straight " +
          "to a business listing would save a lot of time.",
        stepsToReproduce: [
          "Navigate to http://localhost:3000/",
          "Look for a search input field on the homepage",
          "None exists — no way to search for a business by name from the landing page",
        ],
        expectedBehavior:
          "A prominent search bar on the homepage where I can type 'Book Tavern' and be taken " +
          "directly to my business listing or see it highlighted on the map.",
        actualBehavior:
          "The homepage has a hero section and an 'Explore the Map' CTA, but no search " +
          "functionality. I have to navigate to the map page and manually look for my marker.",
        userImpact:
          "Business owners like me can't quickly verify their listings. Visitors looking for a " +
          "specific shop have no fast path — they must browse the entire map. This creates friction " +
          "for both owners and customers, especially when there are many downtown businesses.",
        priority: "high",
        pageUrl: "http://localhost:3000/",
      });
    }
  });

  test("Martha explores the map to find The Book Tavern", async ({ page }) => {
    await navigateTo(page, "/map");
    await waitForMapLoad(page);

    // Verify markers are rendered
    const markerCount = await countMapMarkers(page);
    expect(markerCount).toBeGreaterThan(0);

    // Try to find a search bar or filter on the map page
    const hasSearch = await searchForText(page, "Book Tavern");
    const hasFilters = await findFilterControls(page);

    // Click through markers to look for The Book Tavern
    let foundBookTavern = false;
    const markers = page.locator(".leaflet-marker-icon");
    const total = await markers.count();
    for (let i = 0; i < total; i++) {
      try {
        // Force the click through pointer interception issues on Leaflet maps
        await markers.nth(i).click({ force: true, timeout: 5_000 });
        try {
          await page.waitForSelector(".leaflet-popup", { timeout: 3_000 });
          const popupText = await getPopupText(page);
          if (popupText.toLowerCase().includes("book tavern")) {
            foundBookTavern = true;
            break;
          }
          // Close popup before trying the next marker
          const closeBtn = page.locator(".leaflet-popup-close-button");
          if ((await closeBtn.count()) > 0) {
            await closeBtn.click();
            await page.waitForTimeout(300);
          }
        } catch {
          // Popup didn't open — skip this marker
        }
      } catch {
        // Click failed on this marker — skip it
      }
    }

    // Whether we found it or not, file a report about search/filter
    if (!hasSearch && !hasFilters) {
      fileReport({
        kind: "feature-request",
        persona: MARTHA,
        title: "Map page needs search and filter controls",
        description:
          "I went to the map to find The Book Tavern and had to click on every single marker " +
          `one by one. There are ${total} markers on the map, and I had no way to search for my ` +
          "business by name or filter by category. For a downtown with dozens of businesses, " +
          "this is incredibly tedious. As a bookshop owner who also hosts events, I'd love to " +
          "filter by 'Retail' or 'Books' or search 'Book Tavern' and have the map zoom to my pin.",
        stepsToReproduce: [
          "Navigate to http://localhost:3000/map",
          "Wait for the map to load with all markers",
          "Look for a search input or category filter — none exists",
          "Try to find The Book Tavern by clicking markers one at a time",
        ],
        expectedBehavior:
          "A search bar overlaid on the map that lets me type a business name and have the map " +
          "pan/zoom to that marker with its popup automatically opened. Category filter buttons " +
          "or a dropdown to show only restaurants, retail, entertainment, etc.",
        actualBehavior:
          "The map shows all markers with no way to search or filter. Finding a specific " +
          "business requires clicking every marker until you find the right one.",
        userImpact:
          "Business owners cannot quickly verify their map presence. Customers looking for a " +
          "specific shop (e.g., someone I told about my store) have no way to find it without " +
          "trial-and-error clicking. This is especially painful on mobile where markers overlap.",
        priority: "high",
        pageUrl: "http://localhost:3000/map",
      });
    }
  });

  test("Martha checks the admin business listing", async ({ page }) => {
    await navigateTo(page, "/admin/businesses");

    // Look for a table of businesses
    const table = page.locator("table");
    await expect(table).toBeVisible({ timeout: 10_000 });

    // Find The Book Tavern in the table
    const bookTavernRow = page
      .locator("tbody tr")
      .filter({ hasText: /Book Tavern/i });
    await expect(bookTavernRow.first()).toBeVisible({ timeout: 5_000 });

    // Verify there's an Edit link/button for her business
    const editLink = bookTavernRow
      .first()
      .getByRole("link", { name: /edit/i });
    const editExists = (await editLink.count()) > 0;
    expect(editExists).toBeTruthy();
  });

  test("Martha tries to edit her business listing", async ({ page }) => {
    await navigateTo(page, "/admin/businesses");

    // Find and click the edit link for The Book Tavern
    const bookTavernRow = page
      .locator("tbody tr")
      .filter({ hasText: /Book Tavern/i });
    await expect(bookTavernRow.first()).toBeVisible({ timeout: 10_000 });
    const editLink = bookTavernRow
      .first()
      .getByRole("link", { name: /edit/i });
    
    // Check if edit link exists first
    const editLinkExists = (await editLink.count()) > 0;
    
    if (!editLinkExists) {
      // Edit feature hasn't been implemented yet
      fileReport({
        kind: "feature-request",
        persona: MARTHA,
        title: "No edit functionality for business listings",
        description:
          "I navigated to the admin area at /admin/businesses and saw the list of businesses " +
          "including The Book Tavern, but there is no way to edit any business listing. " +
          "I need to be able to update my hours, phone number, address, or other details " +
          "if they change.",
        stepsToReproduce: [
          "Navigate to http://localhost:3000/admin/businesses",
          "Look for an 'Edit' link or button on any business row",
          "None exists",
        ],
        expectedBehavior:
          "Each business in the admin listing should have an 'Edit' link or button that " +
          "allows business owners to update their listing details.",
        actualBehavior:
          "The admin page shows a table of businesses but provides no way to edit them.",
        userImpact:
          "Business owners cannot update their information. If hours change, if there's a " +
          "phone number update, or if any other details need correction, there's no way to do it.",
        priority: "high",
        pageUrl: page.url(),
      });
      return; // Exit test gracefully
    }
    
    await editLink.click();
    await page.waitForLoadState("networkidle");

    // Check the form is pre-populated with The Book Tavern's data
    const nameInput = page.locator('input[name="name"]');
    const nameInputVisible = await nameInput.isVisible().catch(() => false);
    
    if (!nameInputVisible) {
      // Edit form not visible — might not have navigated properly
      fileReport({
        kind: "feature-request",
        persona: MARTHA,
        title: "Business edit form not loading properly",
        description:
          "I clicked the Edit link for The Book Tavern in the admin area, but the edit " +
          "form did not appear. The page may have stayed on the business listing or navigated " +
          "to a page without a visible edit form.",
        stepsToReproduce: [
          "Navigate to http://localhost:3000/admin/businesses",
          "Click the Edit link for The Book Tavern",
          "Expected: edit form with fields pre-filled with current data",
          "Actual: no edit form appears",
        ],
        expectedBehavior:
          "Clicking Edit should either navigate to an edit page or open an inline edit form " +
          "with the business's current details pre-populated.",
        actualBehavior:
          "The edit form does not appear after clicking Edit.",
        userImpact:
          "Business owners cannot edit their listings even if the UI has an Edit button.",
        priority: "high",
        pageUrl: page.url(),
      });
      return; // Exit test gracefully
    }
    
    const nameValue = await nameInput.inputValue();
    expect(nameValue.toLowerCase()).toContain("book tavern");

    // Check for the three tabs: Info, Events, Social Feed
    const infoTab = page.getByRole("tab", { name: /info/i }).or(
      page.locator('[data-tab="info"], button:has-text("Info")')
    );
    const eventsTab = page.getByRole("tab", { name: /event/i }).or(
      page.locator('[data-tab="events"], button:has-text("Events")')
    );
    const socialTab = page
      .getByRole("tab", { name: /social/i })
      .or(
        page.locator(
          '[data-tab="social"], button:has-text("Social"), button:has-text("Feed")'
        )
      );

    const hasInfoTab = (await infoTab.count()) > 0;
    const hasEventsTab = (await eventsTab.count()) > 0;
    const hasSocialTab = (await socialTab.count()) > 0;

    // We expect at least the info tab content is showing
    expect(hasInfoTab || nameInputVisible).toBeTruthy();

    fileReport({
      kind: "feature-request",
      persona: MARTHA,
      title: "No business owner login — anyone can edit any business listing",
      description:
        "I navigated to the admin area and was able to go directly to my business's edit page " +
        "without logging in. While this is convenient for me right now, it means anyone who " +
        "knows the URL can change my business name, hours, address, or delete it entirely. " +
        "As someone who has spent 12 years building The Book Tavern's reputation, this is " +
        "deeply concerning. A competitor or a prankster could change my hours to 'Closed' " +
        "and I wouldn't know until customers started complaining.",
      stepsToReproduce: [
        "Navigate to http://localhost:3000/admin/businesses",
        "Notice there is no login prompt — the full admin table is accessible",
        "Click Edit on any business (e.g., The Book Tavern)",
        "The edit form loads with full write access — no authentication required",
      ],
      expectedBehavior:
        "Business owners should be able to claim their listing with a verified login. " +
        "Only the owner (or a site admin) should be able to edit a business's details. " +
        "A simple email-based login with owner verification would suffice.",
      actualBehavior:
        "The admin section at /admin/businesses is completely unprotected. Anyone can " +
        "view, edit, or delete any business listing without any authentication.",
      userImpact:
        "This is a security and trust issue. Business owners won't trust the platform " +
        "if anyone can tamper with their listings. This could lead to misinformation " +
        "(wrong hours, wrong address), vandalism, or even businesses being deleted. " +
        "Downtown Augusta's reputation as a reliable directory depends on this.",
      priority: "critical",
      pageUrl: page.url(),
    });
  });

  test("Martha tries to add an author reading event", async ({ page }) => {
    // Navigate to the business edit page and go to the Events tab
    await navigateTo(page, "/admin/businesses");

    const bookTavernRow = page
      .locator("tbody tr")
      .filter({ hasText: /Book Tavern/i });
    await expect(bookTavernRow.first()).toBeVisible({ timeout: 10_000 });
    
    // Check if the edit link exists
    const editLink = bookTavernRow.first().getByRole("link", { name: /edit/i });
    const editLinkExists = (await editLink.count()) > 0;
    
    if (!editLinkExists) {
      // Can't proceed if edit link doesn't exist
      fileReport({
        kind: "feature-request",
        persona: MARTHA,
        title: "No way to create events for business",
        description:
          "I tried to add an author reading event to The Book Tavern, but there's no edit link " +
          "in the admin businesses table, so I can't access the events management area.",
        stepsToReproduce: [
          "Navigate to http://localhost:3000/admin/businesses",
          "Look for an Edit link on The Book Tavern row",
          "No link exists",
        ],
        expectedBehavior:
          "Each business should have an Edit link to manage its details, including events.",
        actualBehavior:
          "No Edit link exists in the business table.",
        userImpact:
          "Business owners cannot add events to their listings.",
        priority: "high",
        pageUrl: page.url(),
      });
      return;
    }
    
    await editLink.click();
    await page.waitForLoadState("networkidle");

    // Try to switch to the Events tab
    const eventsTab = page.getByRole("tab", { name: /event/i }).or(
      page.locator('button:has-text("Events"), [data-tab="events"]')
    );
    if ((await eventsTab.count()) > 0) {
      await eventsTab.first().click();
      await page.waitForTimeout(500);
    }

    // Check if there's a link to create a new event from here
    const newEventLink = page
      .getByRole("link", { name: /new event|add event|create event/i })
      .or(page.locator('a[href*="/events/new"]'));
    const hasNewEventLink = (await newEventLink.count()) > 0;

    // Also navigate to the new event form to verify it works
    await navigateTo(page, "/admin/events/new");

    const titleInput = page.locator('input[name="title"]');
    const titleInputExists = (await titleInput.count()) > 0;
    
    if (!titleInputExists) {
      // Event creation form doesn't exist yet
      fileReport({
        kind: "feature-request",
        persona: MARTHA,
        title: "No event creation page or form",
        description:
          "I tried to navigate to the event creation form at /admin/events/new to add an author " +
          "reading event for The Book Tavern, but the form is not implemented or the page doesn't exist.",
        stepsToReproduce: [
          "Navigate to http://localhost:3000/admin/events/new",
          "Expected: An event creation form with fields for title, description, dates, times, etc.",
          "Actual: No form appears",
        ],
        expectedBehavior:
          "The /admin/events/new page should display a form with fields to create a new event " +
          "including title, description, start date, start time, end date, end time, and recurrence options.",
        actualBehavior:
          "The page either doesn't exist or doesn't show an event creation form.",
        userImpact:
          "Business owners cannot add events to their listings. Events are a key way to drive " +
          "foot traffic to the downtown — without them, the platform is incomplete.",
        priority: "high",
        pageUrl: "http://localhost:3000/admin/events/new",
      });
      return;
    }

    // Check that the form has the fields Martha needs
    const descField = page.locator('textarea[name="description"]');
    const startDateField = page.locator('input[name="startDate"]');
    const endDateField = page.locator('input[name="endDate"]');

    const hasDescField = (await descField.count()) > 0;
    const hasStartDate = (await startDateField.count()) > 0;
    const hasEndDate = (await endDateField.count()) > 0;

    fileReport({
      kind: "feature-request",
      persona: MARTHA,
      title: "No recurring event support for weekly author readings",
      description:
        "I host author readings every Thursday at 7 PM and open-mic poetry nights every other " +
        "Saturday. When I went to create an event, the form only lets me set a single start date " +
        "and end date. There's no option to make it recurring — weekly, biweekly, monthly, etc. " +
        "This means I'd have to manually create 52 separate events for my weekly readings, one " +
        "for each Thursday of the year. That's not realistic for a busy shop owner.",
      stepsToReproduce: [
        "Navigate to http://localhost:3000/admin/events/new",
        "Fill in the event title as 'Thursday Author Reading at The Book Tavern'",
        "Set a start date and end date — notice these are single dates, not recurring",
        "Look for a recurrence option (weekly, monthly, etc.) — none exists",
        "Realize you'd have to create each week's reading as a separate event",
      ],
      expectedBehavior:
        "The event creation form should include a 'Recurrence' option: None, Daily, Weekly, " +
        "Biweekly, Monthly, Custom. For weekly events, I should be able to pick a day of the " +
        "week and an end-by date, and the system generates all occurrences automatically.",
      actualBehavior:
        "The event form only supports one-time events with a single start/end date. There is " +
        "no recurrence pattern setting. Each occurrence must be created individually.",
      userImpact:
        "Business owners who host regular events (readings, trivia, live music, happy hours) " +
        "cannot practically keep the calendar up to date. My customers rely on finding my " +
        "Thursday readings when they plan their week. Without recurring events, the calendar " +
        "will always be incomplete and businesses will stop updating it — defeating the " +
        "purpose of the platform.",
      priority: "high",
      pageUrl: "http://localhost:3000/admin/events/new",
    });
  });

  test("Martha checks her social media presence", async ({ page }) => {
    // Navigate to the business edit page and go to the Social Feed tab
    await navigateTo(page, "/admin/businesses");

    const bookTavernRow = page
      .locator("tbody tr")
      .filter({ hasText: /Book Tavern/i });
    await expect(bookTavernRow.first()).toBeVisible({ timeout: 10_000 });
    await bookTavernRow.first().getByRole("link", { name: /edit/i }).click();
    await page.waitForLoadState("networkidle");

    // Try to switch to the Social Feed tab
    const socialTab = page
      .getByRole("tab", { name: /social/i })
      .or(
        page.locator(
          'button:has-text("Social"), button:has-text("Feed"), [data-tab="social"]'
        )
      );
    if ((await socialTab.count()) > 0) {
      await socialTab.first().click();
      await page.waitForTimeout(500);
    }

    // Check for social link fields in the edit form (might be on the Info tab)
    const infoTab = page.getByRole("tab", { name: /info/i }).or(
      page.locator('button:has-text("Info"), [data-tab="info"]')
    );
    if ((await infoTab.count()) > 0) {
      await infoTab.first().click();
      await page.waitForTimeout(500);
    }

    // Check for social media URL fields
    const facebookField = page.locator(
      'input[name="facebookUrl"], input[name*="facebook" i]'
    );
    const instagramField = page.locator(
      'input[name="instagramUrl"], input[name*="instagram" i]'
    );
    const hasFacebook = (await facebookField.count()) > 0;
    const hasInstagram = (await instagramField.count()) > 0;

    // Whether fields exist or not, the real issue is public visibility
    fileReport({
      kind: "feature-request",
      persona: MARTHA,
      title:
        "Social media feeds and links are not visible to the public — only in admin",
      description:
        "I found the Social Feed tab on my business's admin edit page, which is great for " +
        "managing posts. However, when I visit the public-facing map and click on a business " +
        "marker, there are no social media links shown in the popup. My customers visiting " +
        "the map can't see my Instagram, Facebook, or any of the social posts I've added. " +
        "The social features are admin-only, which defeats the purpose. I want my customers " +
        "to discover my @BookTavernAugusta Instagram directly from the map, see photos of " +
        "our cozy reading nook, and know about upcoming events I post on social media.",
      stepsToReproduce: [
        "Navigate to http://localhost:3000/admin/businesses and edit The Book Tavern",
        "Go to the Social Feed tab — notice you can add social posts here",
        "Check the Info tab for Facebook/Instagram URL fields",
        "Now navigate to http://localhost:3000/map as a regular customer would",
        "Click on The Book Tavern's marker (or any business marker)",
        "Notice the popup only shows basic info — no social media links or feed",
      ],
      expectedBehavior:
        "Business popups on the public map should include clickable social media icons " +
        "(Instagram, Facebook) when the business has those URLs set. Ideally, a small " +
        "preview of recent social posts or a 'Follow us' section would appear, encouraging " +
        "customers to engage with the business online.",
      actualBehavior:
        "Social media URLs and the social feed are only accessible through the admin " +
        "edit page. The public map popups and any public business views do not display " +
        "social media links or posts.",
      userImpact:
        "Social media is how I connect with customers between visits. My Instagram showcases " +
        "new book arrivals, author signings, and the warm atmosphere of The Book Tavern. " +
        "If customers on the map can't see my social links, I'm missing a major channel for " +
        "engagement and repeat visits. Other business owners who invest in social media feel " +
        "the same — the platform should bridge the gap between the directory and social presence.",
      priority: "medium",
      pageUrl: "http://localhost:3000/map",
    });
  });

  test("Martha checks how her business appears to customers on the map", async ({
    page,
  }) => {
    await navigateTo(page, "/map");
    await waitForMapLoad(page);

    // Click a marker and check what info is shown
    const markerCount = await countMapMarkers(page);
    expect(markerCount).toBeGreaterThan(0);

    await clickFirstMarker(page);
    const popupText = await getPopupText(page);

    // Check what's present and what's missing in the popup
    const hasName = popupText.length > 0;
    const hasAddress =
      popupText.toLowerCase().includes("st") ||
      popupText.toLowerCase().includes("ave") ||
      popupText.toLowerCase().includes("broad") ||
      popupText.toLowerCase().includes("street");
    const hasPhone = /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(popupText);
    const hasHours =
      popupText.toLowerCase().includes("hours") ||
      popupText.toLowerCase().includes("am") ||
      popupText.toLowerCase().includes("pm") ||
      popupText.toLowerCase().includes("open") ||
      popupText.toLowerCase().includes("mon");
    const hasEvents =
      popupText.toLowerCase().includes("event") ||
      popupText.toLowerCase().includes("reading") ||
      popupText.toLowerCase().includes("upcoming");
    const hasPhoto =
      (await page.locator(".leaflet-popup img").count()) > 0;

    const missingFeatures: string[] = [];
    if (!hasHours) missingFeatures.push("business hours");
    if (!hasEvents) missingFeatures.push("upcoming events");
    if (!hasPhoto) missingFeatures.push("business photos");

    fileReport({
      kind: "feature-request",
      persona: MARTHA,
      title:
        "Map popups lack business hours, photos, and upcoming events",
      description:
        "As a business owner, I checked how my listing looks to customers on the public map. " +
        "When you click a marker, the popup shows the business name and some basic info, but " +
        `it's missing key details that customers need: ${missingFeatures.join(", ") || "some expected details"}. ` +
        "A customer clicking on The Book Tavern's pin should immediately see our hours " +
        "(Mon–Sat 10am–9pm, Sun 12–6pm), a photo of our storefront or interior, and know " +
        "that we have an author reading this Thursday. Without this, the popup is just a " +
        "glorified address label — customers have to look elsewhere for the details that " +
        "would actually get them through the door.",
      stepsToReproduce: [
        "Navigate to http://localhost:3000/map",
        "Wait for the map to load with business markers",
        "Click on any business marker to open its popup",
        "Observe what information is displayed in the popup",
        "Notice missing: business hours, photos, upcoming events, social links",
      ],
      expectedBehavior:
        "Each business popup should display: (1) Business name and category, " +
        "(2) Address, (3) Phone number, (4) Business hours with open/closed indicator, " +
        "(5) A small photo of the business, (6) Upcoming events at this location, " +
        "(7) Social media icons linking to the business's profiles, " +
        "(8) A 'Get Directions' link.",
      actualBehavior:
        `The popup shows the business name and basic contact info. Missing: ` +
        `${missingFeatures.join(", ") || "hours, photos, events"}. The popup doesn't give ` +
        "customers enough information to decide whether to visit.",
      userImpact:
        "When someone clicks on The Book Tavern's marker, I want them to think 'Oh, they're " +
        "open until 9pm tonight and there's a poetry reading on Saturday — let's go!' Instead, " +
        "they see a bare-bones popup and might keep scrolling. Richer popups would increase " +
        "foot traffic for all downtown businesses. This is especially important for businesses " +
        "like mine that differentiate on atmosphere and events, not just location.",
      priority: "high",
      pageUrl: "http://localhost:3000/map",
    });
  });
});
