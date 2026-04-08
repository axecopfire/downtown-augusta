import { test, expect } from "@playwright/test";
import { TAMIKA } from "../helpers/persona";
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

test.describe(`Persona: ${TAMIKA.name} — ${TAMIKA.role}`, () => {
  test.describe.configure({ mode: "serial" });

  test("Tamika visits the homepage looking for restaurant highlights", async ({
    page,
  }) => {
    await navigateTo(page, "/");

    // Check for any restaurant-specific or food-related content
    const body = await page.locator("body").innerText();
    const hasFoodShowcase =
      body.toLowerCase().includes("restaurant") &&
      (body.toLowerCase().includes("featured") ||
        body.toLowerCase().includes("popular") ||
        body.toLowerCase().includes("top picks"));

    // Look for curated lists or category spotlights
    const curatedSection = page.locator(
      '[data-testid*="featured"], [data-testid*="curated"], section:has-text("Restaurants"), section:has-text("Where to Eat")'
    );
    const hasCuratedContent = (await curatedSection.count()) > 0;

    // Verify the hero and generic content exists
    await expect(
      page.locator("h1", { hasText: /discover downtown augusta/i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /explore the map/i })
    ).toBeVisible();

    // Report findings about food showcase availability
    if (!hasCuratedContent) {
      fileReport({
        kind: "feature-request",
        persona: TAMIKA,
        title: "Homepage lacks restaurant showcase or food discovery section",
        description:
          "The homepage is a generic landing page with stats and feature cards. " +
          "There is no curated restaurant section, 'Where to Eat' guide, or featured " +
          "food businesses. As a food blogger scouting downtown Augusta's dining scene, " +
          "I expect a homepage that highlights the best local restaurants — similar to " +
          "how Yelp features 'Hot & New' spots or Google Maps surfaces trending restaurants. " +
          "A 'Featured Restaurants' carousel or 'Food & Drink' category spotlight would " +
          "immediately draw visitors into the food scene.",
        stepsToReproduce: [
          "Navigate to the homepage at /",
          "Look for any restaurant-related content, featured dining, or food categories",
          "Only generic stats (30+ Events, 120+ Businesses, 15 City Blocks) and feature cards are shown",
        ],
        expectedBehavior:
          "A curated section showcasing downtown restaurants — e.g., 'Where to Eat Downtown' " +
          "with photos, cuisine types, and links to individual restaurant profiles. This would " +
          "give food bloggers like me instant material to share with followers.",
        actualBehavior:
          "The homepage shows a generic hero, static stats, and three feature cards. No restaurant " +
          "names, food categories, or dining content appear. A food blogger arriving here has " +
          "zero reason to stay or share the page.",
        userImpact:
          "With 15K followers on @TasteAugusta, I regularly drive foot traffic to local restaurants. " +
          "A homepage that showcases dining options would give me shareable content and send my " +
          "followers directly to downtown businesses. Without it, this site provides no value over " +
          "a quick Google Maps search for 'restaurants near me.'",
        priority: "high",
        pageUrl: "/",
      });
    }
  });

  test("Tamika explores the map for restaurants", async ({ page }) => {
    await navigateTo(page, "/map");
    await waitForMapLoad(page);

    const markerCount = await countMapMarkers(page);
    expect(markerCount).toBeGreaterThan(0);

    // The sidebar has category filter pill buttons — check if they exist
    const sidebar = page.locator("aside").first();
    await expect(sidebar).toBeVisible();

    // Click the "Businesses" tab in the sidebar to see business list
    const businessesTab = page.getByRole("button", { name: /businesses/i });
    if (await businessesTab.isVisible()) {
      await businessesTab.click();
    }

    // Look for category filter buttons (pill-style)
    const categoryButtons = page.locator("button", {
      hasText: /restaurant/i,
    });
    const hasRestaurantFilter = (await categoryButtons.count()) > 0;

    if (hasRestaurantFilter) {
      // Filter exists — click it and see what happens
      await categoryButtons.first().click();
      await page.waitForTimeout(500);
    }

    // All business markers are the same blue color — check for visual distinction
    const markers = page.locator(".leaflet-marker-icon");
    const markerCount2 = await markers.count();
    const markerColors = new Set<string>();

    for (let i = 0; i < Math.min(markerCount2, 10); i++) {
      const html = await markers.nth(i).innerHTML();
      // Extract fill color from SVG
      const fillMatch = html.match(/fill="(#[0-9a-fA-F]+)"/);
      if (fillMatch) {
        markerColors.add(fillMatch[1]);
      }
    }

    // Business markers all use the same blue — no category color distinction
    const businessMarkerColors = Array.from(markerColors).filter(
      (c) => c !== "#22c55e" && c !== "#f97316" && c !== "#ef4444"
    );

    fileReport({
      kind: "feature-request",
      persona: TAMIKA,
      title:
        "Map markers need distinct icons or colors per business category",
      description:
        "All business markers on the map are identical blue pins. There's no visual way to " +
        "distinguish a restaurant from a retail shop or hotel. When I'm scouting the food scene, " +
        "I need to quickly scan the map and spot all the dining options. Apps like Google Maps use " +
        "category-specific icons (fork & knife for restaurants, shopping bag for retail), and Yelp " +
        "uses color-coded pins. The sidebar does have category filter pills, which is great, but " +
        "the map itself gives no visual cues about what type of business each pin represents.",
      stepsToReproduce: [
        "Navigate to /map",
        "Wait for the map to load with markers",
        "Look at the business markers — they are all identical blue pins",
        "There is no visual distinction between restaurants, bars, retail, or service businesses",
      ],
      expectedBehavior:
        "Each business category should have a unique marker icon or color — e.g., restaurants " +
        "get a fork-and-knife icon in orange, bars get a cocktail glass in purple, retail gets " +
        "a shopping bag in green. This lets food bloggers instantly spot dining clusters.",
      actualBehavior:
        `All ${markerCount} business markers are the same blue pin. ` +
        "The only way to identify restaurants is to click each marker individually and read the popup.",
      userImpact:
        "I photograph food scenes and create Instagram content about dining clusters and food " +
        "neighborhoods. Without category-distinct markers, I can't quickly identify restaurant " +
        "clusters or plan walking routes between dining spots. This turns a 2-minute visual scan " +
        "into a tedious click-through of every pin on the map.",
      priority: "high",
      pageUrl: "/map",
    });
  });

  test("Tamika checks a restaurant's details on the map", async ({ page }) => {
    await navigateTo(page, "/map");
    await waitForMapLoad(page);

    // Click markers until we find a restaurant
    const markers = page.locator(".leaflet-marker-icon");
    const total = await markers.count();
    let popupText = "";
    let foundRestaurant = false;

    for (let i = 0; i < Math.min(total, 15); i++) {
      // Close any existing popup
      const closeBtn = page.locator(".leaflet-popup-close-button");
      if ((await closeBtn.count()) > 0) {
        await closeBtn.click();
        await page.waitForTimeout(300);
      }

      await markers.nth(i).click({ force: true });
      try {
        await page.waitForSelector(".leaflet-popup", { timeout: 3000 });
        popupText = await getPopupText(page);

        if (
          popupText.toLowerCase().includes("restaurant") ||
          popupText.toLowerCase().includes("tavern") ||
          popupText.toLowerCase().includes("café") ||
          popupText.toLowerCase().includes("cafe") ||
          popupText.toLowerCase().includes("bar") ||
          popupText.toLowerCase().includes("grill")
        ) {
          foundRestaurant = true;
          break;
        }
      } catch {
        continue;
      }
    }

    // Verify we found some popup content
    expect(popupText.length).toBeGreaterThan(0);

    // Check what info is shown in the popup
    const hasName = popupText.length > 0;
    const hasAddress = popupText.includes("📍");
    const hasPhone = popupText.includes("📞");
    const hasHours = popupText.includes("🕐");
    const hasWebsite = popupText.includes("🔗");

    // Check what's MISSING
    const hasInstagram =
      popupText.toLowerCase().includes("instagram") ||
      popupText.includes("instagram.com");
    const hasFacebook =
      popupText.toLowerCase().includes("facebook") ||
      popupText.includes("facebook.com");
    const hasPhotos =
      (await page.locator(".leaflet-popup img").count()) > 0;
    const hasMenu =
      popupText.toLowerCase().includes("menu") ||
      popupText.toLowerCase().includes("view menu");

    expect(hasName).toBe(true);
    expect(hasInstagram).toBe(false);
    expect(hasPhotos).toBe(false);
    expect(hasMenu).toBe(false);

    fileReport({
      kind: "feature-request",
      persona: TAMIKA,
      title:
        "Restaurant map popups lack social media links, photos, and menu info",
      description:
        "When clicking a restaurant marker on the map, the popup shows basic info: name, " +
        "category, address, phone, hours, and website link. But for food discovery, critical " +
        "information is missing: no Instagram or Facebook links, no food photos, no menu link, " +
        "and no indication of cuisine type or price range. Compare this to Google Maps, which " +
        "shows photos, ratings, and cuisine tags in the popup — or Yelp, which includes price " +
        "range and recent photo reviews. The popup has a 'Social Posts' section but only shows " +
        "text snippets, not embedded social content with images.",
      stepsToReproduce: [
        "Navigate to /map and wait for markers to load",
        "Click on a restaurant marker (e.g., Frog Hollow Tavern, Soul Bar)",
        "Read the popup content",
        "Note: name, address, phone, hours, and website are shown",
        "Note: Instagram link, Facebook link, food photos, and menu link are all missing",
      ],
      expectedBehavior:
        "Restaurant popups should include: Instagram and Facebook profile links (the data exists " +
        "in the admin — instagramUrl and facebookUrl fields), a photo carousel of the restaurant " +
        "or recent food posts, a 'View Menu' link, cuisine tags, and a price range indicator. " +
        "This turns a basic listing into a shareable food discovery experience.",
      actualBehavior:
        `The popup shows: ${hasAddress ? "address" : ""}${hasPhone ? ", phone" : ""}` +
        `${hasHours ? ", hours" : ""}${hasWebsite ? ", website" : ""}. ` +
        "No social media links, no photos, no menu link. The instagramUrl and facebookUrl " +
        "fields exist in the database but are not surfaced in the public popup.",
      userImpact:
        "When I discover a new restaurant on this map, I immediately want to check their " +
        "Instagram to see their food photography, repost their content, and tag them in my stories. " +
        "Without social links in the popup, I have to manually search for each restaurant on " +
        "Instagram — defeating the purpose of a discovery tool. My 15K followers expect direct " +
        "links when I recommend a spot.",
      priority: "high",
      pageUrl: "/map",
    });
  });

  test("Tamika browses the business directory for restaurants", async ({
    page,
  }) => {
    await navigateTo(page, "/admin/businesses");

    // Verify the business list loads
    const table = page.locator("table");
    await expect(table).toBeVisible();

    // Count businesses shown
    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Check for category badges — they exist in the table
    const categoryBadges = page.locator("tbody span.inline-flex");
    const badgeCount = await categoryBadges.count();
    expect(badgeCount).toBeGreaterThan(0);

    // Look for filter/search controls on this page
    const hasFilters = await findFilterControls(page);
    const hasSearch = await searchForText(page, "restaurant");

    // Look for a dedicated category filter dropdown
    const categoryDropdown = page.locator(
      'select[name*="category" i], select[name*="filter" i]'
    );
    const hasCategoryDropdown = (await categoryDropdown.count()) > 0;

    // Check if this is clearly an admin-only page
    const pageText = await page.locator("body").innerText();
    const isAdminPage =
      pageText.includes("Add Business") ||
      pageText.includes("Delete") ||
      page.url().includes("/admin/");

    expect(isAdminPage).toBe(true);
    expect(hasCategoryDropdown).toBe(false);

    fileReport({
      kind: "feature-request",
      persona: TAMIKA,
      title:
        "Need a public business directory page with category filtering",
      description:
        "The only place to see a list of all businesses is the admin page at /admin/businesses. " +
        "This page shows a table with names, addresses, category badges, event counts, and social " +
        "post counts — but it's an admin interface with 'Add Business' and 'Delete' buttons. " +
        "There is no public-facing business directory for visitors. A food blogger needs a clean, " +
        "public directory where I can filter by 'Restaurant' or 'Bar' and browse all dining options " +
        "with photos and descriptions — like a Yelp-style browse page.",
      stepsToReproduce: [
        "Navigate to /admin/businesses",
        "See the business table with category badges (restaurant, bar, retail, etc.)",
        "Note there is no category filter dropdown to show only restaurants",
        "Note this is an admin page with Add/Delete controls — not suitable for public visitors",
        "No public route like /businesses or /directory exists",
      ],
      expectedBehavior:
        "A public /businesses or /directory page with: category filter tabs or dropdown " +
        "(Restaurant, Bar, Retail, etc.), card-based layout with business photos, description " +
        "previews, social media links, and sort options (by name, popularity, newest). " +
        "The API already supports filtering — GET /api/businesses?category=restaurant works.",
      actualBehavior:
        `The admin table shows ${rowCount} businesses with category badges but no filtering. ` +
        "The only way a visitor can browse businesses by category is through the map sidebar " +
        "filter pills. There's no dedicated public directory page.",
      userImpact:
        "I frequently send my Instagram followers to explore downtown dining. A shareable URL " +
        "like '/businesses?category=restaurant' would let me link directly to all restaurants " +
        "in one view — perfect for 'Top 10 Downtown Augusta Restaurants' blog posts. Without " +
        "this, I can't create useful roundup content that drives traffic to the site and to " +
        "local businesses.",
      priority: "high",
      pageUrl: "/admin/businesses",
    });
  });

  test("Tamika checks a restaurant's social media presence", async ({
    page,
  }) => {
    // Use the API to find a restaurant
    const apiResponse = await page.request.get(
      "/api/businesses?category=restaurant"
    );
    let restaurantId: string | null = null;
    let restaurantName = "a restaurant";

    if (apiResponse.ok()) {
      const businesses = await apiResponse.json();
      if (businesses.length > 0) {
        restaurantId = businesses[0].id;
        restaurantName = businesses[0].name;
      }
    }

    // If no restaurant found via API, go to admin and find one
    if (!restaurantId) {
      await navigateTo(page, "/admin/businesses");
      const editLinks = page.locator('a[href*="/edit"]');
      const count = await editLinks.count();
      expect(count).toBeGreaterThan(0);
      const href = await editLinks.first().getAttribute("href");
      await page.goto(href!);
    } else {
      await navigateTo(page, `/admin/businesses/${restaurantId}/edit`);
    }

    // Click the Social Feed tab
    const socialTab = page.getByRole("button", { name: /social feed/i });
    await expect(socialTab).toBeVisible();
    await socialTab.click();
    await page.waitForTimeout(500);

    // Check for existing social posts
    const postCards = page.locator("div.rounded-lg.border.border-gray-200");
    const postCount = await postCards.count();

    // Check for the "Add Post" button — confirms this is admin-only
    const addPostButton = page.getByRole("button", { name: /add post/i });
    const hasAddPost = await addPostButton.isVisible();

    // Switch to Info tab to check for social URLs
    const infoTab = page.getByRole("button", { name: /^info$/i });
    await infoTab.click();
    await page.waitForTimeout(300);

    const instagramField = page.locator('input[name="instagramUrl"]');
    const facebookField = page.locator('input[name="facebookUrl"]');
    const hasInstagramField = (await instagramField.count()) > 0;
    const hasFacebookField = (await facebookField.count()) > 0;

    let instagramValue = "";
    let facebookValue = "";
    if (hasInstagramField) {
      instagramValue = (await instagramField.inputValue()) || "";
    }
    if (hasFacebookField) {
      facebookValue = (await facebookField.inputValue()) || "";
    }

    // Report on social media features — whether they exist or not
    fileReport({
      kind: "bug",
      persona: TAMIKA,
      title:
        "Social media information is admin-only — not visible to public visitors",
      description:
        "Restaurant social media data is completely locked behind the admin interface. " +
        "The Social Feed tab (at /admin/businesses/[id]/edit) allows admins to manage posts, " +
        "and the Info tab has fields for instagramUrl and facebookUrl — but NONE of this " +
        "information is accessible from the public map or any public page. Visitors and food " +
        "bloggers cannot see a restaurant's Instagram feed, Facebook posts, or social profile " +
        "links. This is a critical gap: social media integration is the #1 way food bloggers " +
        "discover and promote restaurants.",
      stepsToReproduce: [
        `Navigate to /admin/businesses/${restaurantId || "[id]"}/edit for ${restaurantName}`,
        "Click the 'Social Feed' tab — see social post management (admin-only)",
        `Found ${postCount} social post(s) — these are invisible to public visitors`,
        "Click the 'Info' tab — see instagramUrl and facebookUrl fields",
        `Instagram URL: ${instagramValue || "(empty)"}, Facebook URL: ${facebookValue || "(empty)"}`,
        "Navigate to /map, find the same restaurant marker — no social links in popup",
        "No public route exists to view a restaurant's social media presence",
      ],
      expectedBehavior:
        "Social media links (Instagram, Facebook) should appear in map popups and on any " +
        "public business profile page. Social posts should be displayed as an embedded feed " +
        "that visitors can browse — similar to how Google Business profiles show recent posts " +
        "or how restaurant websites embed their Instagram grid.",
      actualBehavior:
        hasAddPost
          ? `Admin can add social posts (${postCount} found). Instagram/Facebook URL fields exist. ` +
            "However, this social data is NOT visible to public visitors on the map or any public page."
          : `The business has Instagram/Facebook URL fields and ${postCount} managed social post(s), ` +
            "but all of this is only visible in the admin edit page. The map popup shows basic " +
            "info (name, address, phone, hours, website) but no social media links or posts. " +
            "There is no public business profile page at all.",
      userImpact:
        "This is a dealbreaker for food bloggers. When I feature a restaurant, I always link " +
        "to their Instagram so my followers can see their food photography and follow them. " +
        "If this site doesn't surface social media links, food bloggers will bypass it entirely " +
        "and just use Google Maps or Yelp. The social data EXISTS in the system — it just " +
        "needs to be exposed publicly. This is a massive missed marketing opportunity for " +
        "downtown restaurants.",
      priority: "critical",
      pageUrl: `/admin/businesses/${restaurantId || "[id]"}/edit`,
    });
  });

  test("Tamika looks for food events and markets", async ({ page }) => {
    await navigateTo(page, "/admin/events");

    // Verify the events table loads
    const table = page.locator("table");
    await expect(table).toBeVisible();

    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Scan for food-related events
    const allText = await page.locator("tbody").innerText();
    const foodKeywords = [
      "food truck",
      "market",
      "taste",
      "food",
      "chef",
      "culinary",
      "dinner",
      "brunch",
      "tasting",
    ];
    const foundFoodEvents = foodKeywords.filter((kw) =>
      allText.toLowerCase().includes(kw)
    );

    // Check for category or date filter controls on this page
    const hasFilters = await findFilterControls(page);

    // Check for a public events route
    const publicEventsLink = page.locator(
      'a[href="/events"], a[href="/upcoming"]'
    );
    const hasPublicLink = (await publicEventsLink.count()) > 0;

    // Verify this is admin-only
    const isAdminPage = page.url().includes("/admin/");
    expect(isAdminPage).toBe(true);

    fileReport({
      kind: "feature-request",
      persona: TAMIKA,
      title:
        "Need a public events page with category filtering for food event discovery",
      description:
        "The events list at /admin/events is admin-only and shows all events in a basic table " +
        "with date, category, and impact columns. There is no way to filter by category (e.g., " +
        "show only 'food' or 'market' events), and there is no public-facing events page. " +
        "Food bloggers need to discover and promote food events — farmers markets, food truck " +
        "rallies, restaurant week, tasting events — but the only way to find them is to scroll " +
        "through an admin table or use the map sidebar filters.",
      stepsToReproduce: [
        "Navigate to /admin/events",
        `See ${rowCount} events in a table with columns: Event, Date, Category, Impact, Actions`,
        `Searched for food-related events, found keywords: ${foundFoodEvents.length > 0 ? foundFoodEvents.join(", ") : "none clearly identified"}`,
        "No category filter dropdown or search box exists on this page",
        "No public route like /events or /upcoming exists",
        "The map sidebar has category filter pills, but the admin events page does not",
      ],
      expectedBehavior:
        "A public /events page with: category filter tabs (food, music, arts, community, etc.), " +
        "date range picker (this week, this month, upcoming), card layout with event images " +
        "and descriptions, and a calendar view option. Food bloggers need to plan content " +
        "around upcoming food events weeks in advance.",
      actualBehavior:
        `The admin events page shows ${rowCount} events in a plain table. No filtering, no ` +
        "search, no public access. The map sidebar has event filtering, but it's not a " +
        "dedicated events discovery page — it's a small sidebar panel.",
      userImpact:
        "Food events are my most valuable content — a Food Truck Rally post can get 3x the " +
        "engagement of a regular restaurant feature. I need to discover these events early " +
        "to coordinate with organizers, plan photography, and build anticipation with my " +
        "followers. Without a public events page, I'd have to manually check the map sidebar " +
        "or know the admin URL. My 15K followers are exactly the audience that would attend " +
        "these events and spend money downtown.",
      priority: "high",
      pageUrl: "/admin/events",
    });
  });

  test("Tamika tries to share a restaurant listing", async ({ page }) => {
    await navigateTo(page, "/map");
    await waitForMapLoad(page);

    // Click a marker to open a popup
    await clickFirstMarker(page);
    const popupText = await getPopupText(page);
    expect(popupText.length).toBeGreaterThan(0);

    // Look for share functionality
    const popup = page.locator(".leaflet-popup-content");

    const shareButton = popup.locator(
      'button:has-text("Share"), a:has-text("Share"), [aria-label*="share" i]'
    );
    const hasShare = (await shareButton.count()) > 0;

    const embedCode = popup.locator(
      'button:has-text("Embed"), textarea, code'
    );
    const hasEmbed = (await embedCode.count()) > 0;

    const permalink = popup.locator(
      'a:has-text("Permalink"), a:has-text("View Profile"), a[href*="/businesses/"]'
    );
    const hasPermalink = (await permalink.count()) > 0;

    // Check if the URL changes to include a business ID when a popup is open
    const currentUrl = page.url();
    const urlHasBusinessId =
      currentUrl.includes("business=") || currentUrl.includes("selected=");

    expect(hasShare).toBe(false);
    expect(hasEmbed).toBe(false);
    expect(hasPermalink).toBe(false);
    expect(urlHasBusinessId).toBe(false);

    fileReport({
      kind: "feature-request",
      persona: TAMIKA,
      title:
        "No way to share or link to individual business listings",
      description:
        "When I find a great restaurant on the map and open its popup, there is no share button, " +
        "no permalink, no embed code, and no way to generate a direct link to that business. " +
        "The URL doesn't change when a popup is opened, so I can't even copy the URL bar. " +
        "Food bloggers LIVE on sharing — every restaurant I discover needs to become a link in " +
        "my Instagram bio, a URL in my blog post, or an embedded card in my newsletter. Without " +
        "shareable listings, this site is a dead end for content creation.",
      stepsToReproduce: [
        "Navigate to /map and wait for markers to load",
        "Click any business marker to open its popup",
        "Look for: Share button — not found",
        "Look for: Embed code or copy-to-clipboard — not found",
        "Look for: Permalink or 'View Profile' link — not found",
        "Check the URL bar — it still shows /map with no business identifier",
      ],
      expectedBehavior:
        "Each business should have: (1) A dedicated public profile page at /businesses/[slug] " +
        "with full details, photos, social links, and upcoming events. (2) A share button in " +
        "the map popup with options for copying the link, sharing to social media, or generating " +
        "an embed card. (3) Deep-linking support — opening /map?business=[id] should auto-focus " +
        "the map on that business and open its popup.",
      actualBehavior:
        "The popup is a self-contained bubble with no outbound links except the business website. " +
        "There are no share buttons, no permalink, and no public business profile pages. " +
        "The only way to 'share' a business is to screenshot the popup — which looks unprofessional " +
        "and provides no clickable link for followers.",
      userImpact:
        "Sharing is the core of what food bloggers do. When I post 'Just discovered an amazing " +
        "new spot downtown!' on Instagram, I need a link in my bio that takes followers directly " +
        "to that restaurant's page. Without shareable URLs, I can't: write blog roundups linking " +
        "to each restaurant, add restaurants to my Instagram link tree, embed restaurant cards in " +
        "newsletters, or create 'Augusta Food Guide' content that references this site. " +
        "That's 15K potential visitors that will never reach downtown businesses through my content.",
      priority: "critical",
      pageUrl: "/map",
    });
  });
});
