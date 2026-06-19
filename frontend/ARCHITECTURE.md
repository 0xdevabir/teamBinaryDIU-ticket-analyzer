# Frontend Architecture — Ticket Analyzer

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI library |
| TypeScript | Type safety |
| Vite | Build tool + dev server |
| TailwindCSS | Utility-first styling |
| Axios | HTTP client |
| React Router v6 | Client-side routing |
| Lucide React | Icons |

## Folder Structure

```
frontend/src/
├── main.tsx                 # Entry point
├── App.tsx                  # Router wrapper
├── index.css                # Tailwind directives
│
├── api/                     # HTTP layer (Axios)
│   ├── axios.ts             # Instance + interceptors
│   ├── tickets.ts
│   ├── dashboard.ts
│   ├── ai.ts
│   └── index.ts
│
├── types/                   # TypeScript interfaces
│   ├── ticket.ts
│   └── ai.ts
│
├── hooks/                   # Data-fetching hooks
│   ├── useDashboard.ts
│   ├── useTickets.ts
│   └── useCreateTicket.ts
│
├── routes/
│   └── AppRoutes.tsx        # Route definitions
│
├── pages/                   # Route-level components
│   ├── DashboardPage.tsx
│   ├── TicketListPage.tsx
│   ├── TicketDetailPage.tsx
│   ├── CreateTicketPage.tsx
│   └── AIResultsPage.tsx
│
└── components/
    ├── layout/              # App shell
    │   ├── AppLayout.tsx
    │   └── Navbar.tsx
    ├── ui/                  # Reusable primitives
    │   ├── Button.tsx
    │   ├── Card.tsx
    │   ├── Badge.tsx
    │   ├── Input.tsx
    │   ├── Spinner.tsx
    │   └── EmptyState.tsx
    ├── dashboard/
    │   ├── StatsCards.tsx
    │   └── BarChart.tsx
    ├── tickets/
    │   ├── TicketCard.tsx
    │   ├── TicketFilters.tsx
    │   └── AIResultsPanel.tsx
    └── forms/
        └── TicketForm.tsx
```

## Routing Structure

| Path | Page | Feature |
|------|------|---------|
| `/` | DashboardPage | Stats + recent tickets |
| `/tickets` | TicketListPage | Paginated list + filters |
| `/tickets/:id` | TicketDetailPage | Full ticket + inline AI |
| `/tickets/:id/ai` | AIResultsPage | Dedicated AI results view |
| `/create` | CreateTicketPage | Submit + analyze |
| `/ai-results` | AIResultsPage | Preview-only AI results |

## State Management Strategy

| Scope | Strategy |
|-------|----------|
| Server data | Custom hooks (`useDashboard`, `useTickets`) |
| Form state | Local `useState` in pages/forms |
| AI results navigation | React Router `location.state` |
| Global state | None — avoids over-engineering |

No Redux/Context needed. Hooks encapsulate Axios calls, loading, and error states.

## Component Hierarchy

```
App
└── AppLayout
    ├── Navbar
    └── <Outlet>
        ├── DashboardPage
        │   ├── StatsCards
        │   ├── BarChart ×2
        │   └── TicketCard[]
        │
        ├── TicketListPage
        │   ├── TicketFilters
        │   └── TicketCard[]
        │
        ├── TicketDetailPage
        │   ├── Card (description)
        │   └── AIResultsPanel
        │
        ├── CreateTicketPage
        │   └── TicketForm
        │
        └── AIResultsPage
            └── AIResultsPanel
```

## Responsive Design

- Mobile-first Tailwind breakpoints (`sm:`, `md:`, `lg:`)
- Collapsible hamburger nav on mobile
- Grid layouts: 1 col → 2 col → 3 col
- Touch-friendly button sizes (min 44px tap targets)
