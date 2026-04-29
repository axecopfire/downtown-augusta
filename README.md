# Downtown Augusta

A community portal for downtown Augusta, Georgia — connecting local businesses, events, and residents through an interactive map-based interface.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router) with React 19
- **Database**: SQLite via [Prisma 7](https://www.prisma.io) + [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- **Mapping**: [Leaflet](https://leafletjs.com) + [React Leaflet](https://react-leaflet.js.org)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com)
- **Icons**: [Lucide React](https://lucide.dev), [React Icons](https://react-icons.github.io/react-icons)
- **Testing**: [Playwright](https://playwright.dev) (end-to-end)
- **Language**: TypeScript

## Prerequisites

- Node.js >= 22 (see `.nvmrc`)

## Getting Started

```bash
# Use the correct Node version
nvm use

# Install dependencies
npm install

# Set up the database
export DATABASE_URL="file:./dev.db"
npx prisma migrate deploy

# Seed the database with sample data
npm run db:seed

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Prisma database connection string | `file:./prisma/dev.db` |

## Project Structure

```
src/
├── app/                  # Next.js App Router pages and API routes
│   ├── admin/            # Admin interface
│   ├── api/              # REST API endpoints
│   │   ├── businesses/   # Business CRUD
│   │   └── events/       # Event CRUD
│   ├── businesses/       # Business listing and detail pages
│   ├── events/           # Event listing and detail pages
│   ├── map/              # Interactive map view
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Homepage
├── components/           # Reusable UI components
│   ├── map/              # Map-specific components
│   └── ui/               # General UI components
└── lib/                  # Shared utilities
    ├── constants.ts      # App-wide constants
    ├── hours.ts          # Business hours utilities
    └── prisma.ts         # Prisma client singleton
prisma/
├── schema.prisma         # Database schema
├── migrations/           # Database migrations
└── seed.ts               # Seed data script
e2e/
└── tests/                # Playwright end-to-end tests
```

## Data Models

- **Business** — Local businesses with location, contact info, social media links, and operating hours
- **Event** — Community events with dates, location, impact level, and optional polygon boundaries
- **SocialPost** — Aggregated social media posts from businesses
- **EventBusiness** — Many-to-many relationship linking events to participating businesses

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:seed` | Seed the database |
| `npm run test:e2e` | Run Playwright end-to-end tests |

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Ensure linting passes: `npm run lint`
4. Run end-to-end tests: `npm run test:e2e`
5. Submit a pull request
