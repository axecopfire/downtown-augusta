import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database…");

  // Clear existing data
  await prisma.event.deleteMany();
  await prisma.business.deleteMany();
  console.log("  Cleared existing data.");

  // --- Businesses ---
  const businesses = await prisma.business.createMany({
    data: [
      {
        name: "Boll Weevil Café & Sweetery",
        description:
          "Iconic downtown café known for its massive desserts and Southern comfort food.",
        address: "10 James Brown Blvd, Augusta, GA 30901",
        latitude: 33.4741,
        longitude: -81.9694,
        category: "restaurant",
        phone: "(706) 722-7772",
        website: "https://www.bollweevilcafe.com",
        hours: "Mon-Sat 11am-10pm",
      },
      {
        name: "Craft & Vine",
        description:
          "Upscale gastropub featuring craft cocktails and a rotating menu of locally sourced dishes.",
        address: "1002 Broad St, Augusta, GA 30901",
        latitude: 33.4738,
        longitude: -81.9735,
        category: "bar",
        phone: "(706) 364-5300",
        hours: "Tue-Sat 5pm-12am",
      },
      {
        name: "Frog Hollow Tavern",
        description:
          "Farm-to-table dining in a historic building with an award-winning wine list.",
        address: "1282 Broad St, Augusta, GA 30901",
        latitude: 33.4744,
        longitude: -81.9761,
        category: "restaurant",
        phone: "(706) 364-6906",
        website: "https://www.froghollowtavern.com",
        hours: "Tue-Sat 5:30pm-10pm",
      },
      {
        name: "Soul Bar",
        description:
          "Live music venue and bar in the heart of Broad Street's entertainment district.",
        address: "984 Broad St, Augusta, GA 30901",
        latitude: 33.4736,
        longitude: -81.9728,
        category: "entertainment",
        phone: "(706) 481-9540",
        hours: "Wed-Sat 7pm-2am",
      },
      {
        name: "The Book Tavern",
        description:
          "Independent bookstore offering new and used books, local authors, and community events.",
        address: "226 8th St, Augusta, GA 30901",
        latitude: 33.4750,
        longitude: -81.9720,
        category: "retail",
        phone: "(706) 828-3600",
        hours: "Mon-Sat 10am-6pm, Sun 12pm-5pm",
      },
      {
        name: "New Moon Café",
        description:
          "Eclectic café with live music, art displays, and a diverse menu including vegetarian options.",
        address: "1036 Broad St, Augusta, GA 30901",
        latitude: 33.4740,
        longitude: -81.9742,
        category: "restaurant",
        phone: "(706) 725-5005",
        hours: "Mon-Sat 11am-10pm",
      },
      {
        name: "Augusta Museum of History",
        description:
          "Museum showcasing Augusta's rich history from Native Americans to the present, including a James Brown exhibit.",
        address: "560 Reynolds St, Augusta, GA 30901",
        latitude: 33.4758,
        longitude: -81.9700,
        category: "entertainment",
        phone: "(706) 722-8454",
        website: "https://www.augustamuseum.org",
        hours: "Tue-Sat 10am-5pm, Sun 1pm-5pm",
      },
      {
        name: "Augustino's Italian Eatery",
        description:
          "Family-owned Italian restaurant serving handmade pasta, wood-fired pizza, and imported wines.",
        address: "1109 Broad St, Augusta, GA 30901",
        latitude: 33.4742,
        longitude: -81.9749,
        category: "restaurant",
        phone: "(706) 860-4445",
        hours: "Mon-Sat 11am-9pm",
      },
      {
        name: "Pexcho's",
        description:
          "Popular downtown sandwich and taco shop with fast casual service and outdoor seating.",
        address: "850 Broad St, Augusta, GA 30901",
        latitude: 33.4733,
        longitude: -81.9712,
        category: "restaurant",
        phone: "(706) 723-5151",
        hours: "Mon-Fri 11am-3pm",
      },
      {
        name: "Artist Row on Broad",
        description:
          "Gallery and artisan marketplace featuring local artists, pottery, jewelry, and handmade goods.",
        address: "1168 Broad St, Augusta, GA 30901",
        latitude: 33.4743,
        longitude: -81.9756,
        category: "retail",
        phone: "(706) 955-0202",
        hours: "Tue-Sat 11am-6pm",
      },
    ],
  });
  console.log(`  Created ${businesses.count} businesses.`);

  // --- Events ---

  // Dynamic dates for "today" and "this week" events
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(today.getDate() + 2);
  const thisWeekend = new Date(today);
  thisWeekend.setDate(today.getDate() + (6 - today.getDay()));

  const events = await prisma.event.createMany({
    data: [
      // --- Existing events (with polygons) ---
      {
        title: "First Friday Downtown",
        description:
          "Monthly art walk and street festival with live music, food trucks, and open galleries along Broad Street.",
        address: "Broad Street, Augusta, GA 30901",
        latitude: 33.474,
        longitude: -81.9738,
        category: "community",
        startDate: new Date("2026-05-01"),
        endDate: new Date("2026-05-01"),
        startTime: "5:00 PM",
        endTime: "9:00 PM",
        impactLevel: "medium",
        polygon: JSON.stringify([
          [33.4735, -81.976],
          [33.4745, -81.976],
          [33.4745, -81.971],
          [33.4735, -81.971],
        ]),
      },
      {
        title: "Augusta Ironman 70.3",
        description:
          "Half-Ironman triathlon through the streets of Augusta with major road closures downtown. Swim in the Savannah River, bike through Columbia County, and run through downtown.",
        address: "Riverwalk Augusta, Augusta, GA 30901",
        latitude: 33.4762,
        longitude: -81.9687,
        category: "marathon",
        startDate: new Date("2026-09-27"),
        endDate: new Date("2026-09-27"),
        startTime: "7:00 AM",
        endTime: "5:00 PM",
        impactLevel: "high",
        website: "https://www.ironman.com/im703-augusta",
        polygon: JSON.stringify([
          [33.473, -81.978],
          [33.478, -81.978],
          [33.478, -81.968],
          [33.473, -81.968],
        ]),
      },
      {
        title: "Arts in the Heart of Augusta",
        description:
          "Annual multicultural arts and food festival celebrating Augusta's diverse community with over 100 performers and 80 food vendors.",
        address: "Downtown Augusta, Broad St, Augusta, GA 30901",
        latitude: 33.4739,
        longitude: -81.9745,
        category: "festival",
        startDate: new Date("2026-09-18"),
        endDate: new Date("2026-09-20"),
        startTime: "4:00 PM",
        endTime: "11:00 PM",
        impactLevel: "high",
        website: "https://www.artsintheheartofaugusta.com",
        polygon: JSON.stringify([
          [33.4732, -81.977],
          [33.4752, -81.977],
          [33.4752, -81.972],
          [33.4732, -81.972],
        ]),
      },
      {
        title: "Westobou Festival",
        description:
          "A week-long arts festival featuring music, theater, film, visual arts, and interactive installations throughout downtown Augusta.",
        address: "Various Downtown Venues, Augusta, GA 30901",
        latitude: 33.4748,
        longitude: -81.973,
        category: "festival",
        startDate: new Date("2026-10-05"),
        endDate: new Date("2026-10-11"),
        startTime: "12:00 PM",
        endTime: "10:00 PM",
        impactLevel: "medium",
        website: "https://www.westobou.org",
        polygon: JSON.stringify([
          [33.4738, -81.9745],
          [33.4758, -81.9745],
          [33.4758, -81.9715],
          [33.4738, -81.9715],
        ]),
      },
      {
        title: "Saturday Market at the River",
        description:
          "Weekly farmers market along the Riverwalk featuring local produce, crafts, and artisan foods.",
        address: "8th Street Bulkhead, Augusta, GA 30901",
        latitude: 33.4765,
        longitude: -81.971,
        category: "market",
        startDate: new Date("2026-05-09"),
        endDate: new Date("2026-05-09"),
        startTime: "8:00 AM",
        endTime: "12:00 PM",
        impactLevel: "low",
        polygon: JSON.stringify([
          [33.476, -81.9718],
          [33.477, -81.9718],
          [33.477, -81.9702],
          [33.476, -81.9702],
        ]),
      },
      {
        title: "Augusta Southern Nationals Drag Boat Races",
        description:
          "High-speed drag boat racing on the Savannah River, one of the largest drag boat events in the Southeast.",
        address: "Savannah River, Augusta, GA 30901",
        latitude: 33.477,
        longitude: -81.968,
        category: "sports",
        startDate: new Date("2026-06-20"),
        endDate: new Date("2026-06-21"),
        startTime: "9:00 AM",
        endTime: "6:00 PM",
        impactLevel: "medium",
        polygon: JSON.stringify([
          [33.4768, -81.972],
          [33.4778, -81.972],
          [33.4778, -81.965],
          [33.4768, -81.965],
        ]),
      },

      // --- Dynamic "today" and "this week" events ---
      {
        title: "Live Music on Broad",
        description:
          "Evening live music showcase at a Broad Street venue featuring local bands and open mic.",
        address: "984 Broad St, Augusta, GA 30901",
        latitude: 33.4736,
        longitude: -81.9728,
        category: "concert",
        startDate: today,
        endDate: today,
        startTime: "7:00 PM",
        endTime: "10:00 PM",
        impactLevel: "low",
        polygon: JSON.stringify([
          [33.4733, -81.9733],
          [33.4739, -81.9733],
          [33.4739, -81.9723],
          [33.4733, -81.9723],
        ]),
      },
      {
        title: "Downtown Walking Tour",
        description:
          "Guided afternoon walking tour exploring Augusta's historic downtown landmarks and architecture.",
        address: "Augusta Museum of History, 560 Reynolds St, Augusta, GA 30901",
        latitude: 33.4758,
        longitude: -81.97,
        category: "community",
        startDate: today,
        endDate: today,
        startTime: "2:00 PM",
        endTime: "4:00 PM",
        impactLevel: "low",
      },
      {
        title: "Food Truck Rally",
        description:
          "A gathering of the region's best food trucks in a downtown parking lot with picnic seating and live DJ.",
        address: "700 Block Reynolds St, Augusta, GA 30901",
        latitude: 33.4755,
        longitude: -81.971,
        category: "market",
        startDate: tomorrow,
        endDate: tomorrow,
        startTime: "11:00 AM",
        endTime: "8:00 PM",
        impactLevel: "medium",
        polygon: JSON.stringify([
          [33.4751, -81.9716],
          [33.4759, -81.9716],
          [33.4759, -81.9704],
          [33.4751, -81.9704],
        ]),
      },
      {
        title: "Weekend Art Walk",
        description:
          "Self-guided art walk along Broad Street galleries with featured artist receptions and pop-up exhibits.",
        address: "Broad Street, Augusta, GA 30901",
        latitude: 33.4742,
        longitude: -81.975,
        category: "community",
        startDate: thisWeekend,
        endDate: thisWeekend,
        startTime: "10:00 AM",
        endTime: "4:00 PM",
        impactLevel: "medium",
        polygon: JSON.stringify([
          [33.4738, -81.9762],
          [33.4746, -81.9762],
          [33.4746, -81.974],
          [33.4738, -81.974],
        ]),
      },
    ],
  });
  console.log(`  Created ${events.count} events.`);

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
