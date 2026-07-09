# Prompt 1: Project Foundation & Application Shell

## Context

We are building **FarmHand**, a premium enterprise SaaS platform for
offline field data collection, inspections and agricultural operations.
The product is inspired by Device Magic, KoboToolbox and Fulcrum, but
the visual style should be closer to Compound, Linear, Vercel and
Notion.

This is a prototype for a client. The branding will change later, so
build the UI around reusable design tokens and CSS variables instead of
hardcoded colors.

**Do NOT implement authentication, Supabase, APIs, forms or business
logic.**

Focus only on creating a scalable frontend foundation.

------------------------------------------------------------------------

## Tech Stack

-   Next.js 15 (App Router)
-   TypeScript
-   Tailwind CSS
-   shadcn/ui
-   Lucide React

------------------------------------------------------------------------

## Goal

Create the application shell and design foundation that every future
screen will use.

Everything should be modular, reusable and production-ready.

------------------------------------------------------------------------

## Create the Project Structure

``` text
app/

components/
  layout/
  navigation/
  shared/
  dashboard/

lib/

hooks/

types/

data/mock/

styles/
```

------------------------------------------------------------------------

## Design Tokens

Create a centralized design token system using CSS variables.

### Backgrounds

``` text
Background        #F8FAF8
Surface           #FFFFFF
Surface Secondary #F3F5F4
```

### Brand

``` text
Primary           #6FCF5B
Primary Hover     #5CB84A
Primary Soft      #EAF8E7
```

Green is only used for: - Primary buttons - Active navigation - Success
indicators

Never use green for page backgrounds.

### Neutral Palette

``` text
900  #111827
800  #1F2937
700  #374151
600  #4B5563
500  #6B7280
400  #9CA3AF
300  #D1D5DB
200  #E5E7EB
100  #F3F4F6
```

### Semantic Colors

``` text
Success #16A34A
Warning #F59E0B
Error   #DC2626
Info    #2563EB
```

------------------------------------------------------------------------

## Typography

-   Geist
-   Fallback: Inter

------------------------------------------------------------------------

## Border Radius

``` text
Cards     16px
Buttons   12px
Inputs    12px
Dialogs   20px
```

------------------------------------------------------------------------

## Shadows

``` text
Cards
0 1px 2px rgba(16,24,40,.04)

Hover
0 8px 24px rgba(16,24,40,.08)
```

------------------------------------------------------------------------

## Build the Application Layout

Create: - Collapsible sidebar - Sticky top navigation - Main content
area

Sidebar navigation:

``` text
Dashboard

Projects

Forms

Submissions

Registry
    Farmers
    Farms

Maps

Reports

Team

Settings
```

Use Lucide icons.

------------------------------------------------------------------------

## Create Reusable Components

-   AppShell
-   Sidebar
-   Header
-   PageHeader
-   Card
-   MetricCard
-   Button wrappers
-   EmptyState
-   DataTable
-   SearchBar
-   StatusBadge

These should not contain business logic.

------------------------------------------------------------------------

## Dashboard

Create a placeholder dashboard using mock data containing: - Four KPI
cards - Recent Projects table - Recent Activity - Quick Actions

No charts. No forms. No APIs.

------------------------------------------------------------------------

## Code Quality

-   Keep components small.
-   Avoid duplicated code.
-   Use TypeScript everywhere.
-   Use mock JSON data.
-   Follow a clean folder structure.
-   Build for scalability.

------------------------------------------------------------------------

## End Goal

At the end of this milestone I should have a polished SaaS application
shell that can serve as the foundation for all future development.

Do not implement any backend functionality.
