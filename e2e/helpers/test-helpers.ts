import { type Page, expect } from "@playwright/test";

export async function navigateTo(page: Page, path: string) {
  await page.goto(path, { waitUntil: "networkidle" });
}

export async function clickNavLink(page: Page, text: string) {
  await page.getByRole("link", { name: text }).first().click();
  await page.waitForLoadState("networkidle");
}

export async function waitForMapLoad(page: Page) {
  await page.waitForSelector(".leaflet-container", { timeout: 15_000 });
  // Give tiles a moment to render
  await page.waitForTimeout(1000);
}

export async function countMapMarkers(page: Page): Promise<number> {
  return page.locator(".leaflet-marker-icon").count();
}

export async function clickFirstMarker(page: Page) {
  const marker = page.locator(".leaflet-marker-icon").first();
  await marker.click({ force: true, timeout: 2000 });
  await page.waitForSelector(".leaflet-popup", { timeout: 2000 });
}

export async function getPopupText(page: Page): Promise<string> {
  const popup = page.locator(".leaflet-popup-content");
  return popup.innerText();
}

export async function fillBusinessForm(
  page: Page,
  data: {
    name?: string;
    description?: string;
    address?: string;
    latitude?: string;
    longitude?: string;
    category?: string;
    phone?: string;
    website?: string;
    hours?: string;
  }
) {
  if (data.name) {
    const nameField = page.getByLabel('Business Name *');
    await expect(nameField).toBeVisible({ timeout: 5_000 });
    await nameField.fill(data.name);
  }
  if (data.description) {
    const descField = page.getByLabel('Description');
    await expect(descField).toBeVisible({ timeout: 5_000 });
    await descField.fill(data.description);
  }
  if (data.address) {
    const addressField = page.getByLabel('Address *');
    await expect(addressField).toBeVisible({ timeout: 5_000 });
    await addressField.fill(data.address);
  }
  if (data.latitude) {
    const latField = page.getByLabel('Latitude *');
    await expect(latField).toBeVisible({ timeout: 5_000 });
    await latField.fill(data.latitude);
  }
  if (data.longitude) {
    const longField = page.getByLabel('Longitude *');
    await expect(longField).toBeVisible({ timeout: 5_000 });
    await longField.fill(data.longitude);
  }
  if (data.category) {
    const categoryField = page.locator('select[name="category"]');
    await expect(categoryField).toBeVisible({ timeout: 5_000 });
    await categoryField.selectOption(data.category);
  }
  if (data.phone) {
    const phoneField = page.getByLabel('Phone');
    await expect(phoneField).toBeVisible({ timeout: 5_000 });
    await phoneField.fill(data.phone);
  }
  if (data.website) {
    const websiteField = page.getByLabel('Website');
    await expect(websiteField).toBeVisible({ timeout: 5_000 });
    await websiteField.fill(data.website);
  }
  if (data.hours) {
    const hoursField = page.getByLabel('Hours');
    await expect(hoursField).toBeVisible({ timeout: 5_000 });
    await hoursField.fill(data.hours);
  }
}

export async function fillEventForm(
  page: Page,
  data: {
    title?: string;
    description?: string;
    address?: string;
    latitude?: string;
    longitude?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    impactLevel?: string;
  }
) {
  // Wait for form to be ready before filling fields
  if (data.title) {
    const titleField = page.getByLabel('Title *');
    await expect(titleField).toBeVisible({ timeout: 10_000 });
    await titleField.fill(data.title);
  }
  if (data.description) {
    const descField = page.getByLabel('Description');
    await expect(descField).toBeVisible({ timeout: 5_000 });
    await descField.fill(data.description);
  }
  if (data.address) {
    const addressField = page.getByLabel('Address *');
    await expect(addressField).toBeVisible({ timeout: 5_000 });
    await addressField.fill(data.address);
  }
  if (data.latitude) {
    const latField = page.getByLabel('Latitude *');
    await expect(latField).toBeVisible({ timeout: 5_000 });
    await latField.fill(data.latitude);
  }
  if (data.longitude) {
    const longField = page.getByLabel('Longitude *');
    await expect(longField).toBeVisible({ timeout: 5_000 });
    await longField.fill(data.longitude);
  }
  if (data.category) {
    const categoryField = page.getByLabel('Category');
    await expect(categoryField).toBeVisible({ timeout: 5_000 });
    await categoryField.selectOption(data.category);
  }
  if (data.startDate) {
    const startDateField = page.getByLabel('Start Date *');
    await expect(startDateField).toBeVisible({ timeout: 5_000 });
    await startDateField.fill(data.startDate);
  }
  if (data.endDate) {
    const endDateField = page.getByLabel('End Date');
    await expect(endDateField).toBeVisible({ timeout: 5_000 });
    await endDateField.fill(data.endDate);
  }
  if (data.startTime) {
    const startTimeField = page.getByLabel('Start Time');
    await expect(startTimeField).toBeVisible({ timeout: 5_000 });
    await startTimeField.fill(data.startTime);
  }
  if (data.endTime) {
    const endTimeField = page.getByLabel('End Time');
    await expect(endTimeField).toBeVisible({ timeout: 5_000 });
    await endTimeField.fill(data.endTime);
  }
  if (data.impactLevel) {
    const impactButton = page.getByRole('button', { name: data.impactLevel });
    await expect(impactButton).toBeVisible({ timeout: 5_000 });
    await impactButton.click();
  }
}

export async function expectPageTitle(page: Page, text: string | RegExp) {
  await expect(page.locator("h1, h2").first()).toContainText(
    typeof text === "string" ? text : text
  );
}

export async function getTableRowCount(page: Page): Promise<number> {
  return page.locator("tbody tr").count();
}

export async function searchForText(page: Page, text: string): Promise<boolean> {
  const searchInput = page.locator(
    'input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]'
  );
  if ((await searchInput.count()) === 0) {
    return false;
  }
  await searchInput.first().fill(text);
  return true;
}

export async function findFilterControls(page: Page): Promise<boolean> {
  const filters = page.locator(
    'select[name*="category" i], select[name*="filter" i], [data-testid*="filter"], button:has-text("Filter")'
  );
  return (await filters.count()) > 0;
}
