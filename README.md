# Skill Check Assessment Frontend

React 18 + TypeScript frontend for the Skill Check Assessment system. Teachers use tablets (1024×600 landscape) to assess student skills in real-time with instant visual feedback.

## Features

- **Real-time Assessment**: Checkbox-based skill checklist with auto-LULUS status
- **Role-based Access**: Teacher (guru), admin, and student roles with route protection
- **Analytics Dashboard**: Student skills heatmap and gap analysis reports
- **Mobile-first Responsive**: Optimized for tablet (1024×600) and desktop
- **Accessible**: WCAG AA compliant components and forms
- **State Management**: React Query for API sync + React Hook Form for forms
- **Validation**: Zod schemas for runtime type safety

## Tech Stack

- **React 18** with TypeScript
- **Vite** for bundling
- **TailwindCSS** for styling
- **React Router** for navigation
- **React Query** for server state
- **React Hook Form** + Zod for form handling
- **Lucide React** for icons
- **Axios** for HTTP requests

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── LoginForm.tsx
│   ├── StudentRoster.tsx
│   ├── SkillChecklistForm.tsx
│   ├── SkillStatusTabs.tsx
│   ├── AnalyticsHeatmap.tsx
│   ├── GapAnalysisReport.tsx
│   └── ProtectedRoute.tsx
├── pages/              # Page components
│   ├── LoginPage.tsx
│   ├── GuruDashboardPage.tsx
│   ├── AnalyticsPage.tsx
│   ├── AdminPanelPage.tsx
│   └── UnauthorizedPage.tsx
├── services/           # API and business logic
│   ├── api.ts          # Axios wrapper with interceptors
│   ├── authService.ts
│   └── assessmentService.ts
├── contexts/           # React Context (auth, user state)
│   └── AuthContext.tsx
├── types/              # TypeScript interfaces
│   └── index.ts
├── router.tsx          # Route definitions
├── App.tsx             # Root component
├── main.tsx            # Entry point
└── index.css           # Global styles + Tailwind
```

## Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
cd skill-check-frontend
npm install
cp .env.example .env
```

### Environment Variables

Create `.env` from `.env.example`:

```env
VITE_API_URL=http://localhost:8000/api
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ADMIN=true
```

## Development

```bash
npm run dev
```

Dev server runs on `http://localhost:5173` with API proxy to `http://localhost:8000`.

## Build & Preview

```bash
npm run build
npm run preview
```

## Linting

```bash
npm run lint
```

## API Endpoints

Services auto-fetch from `VITE_API_URL`:

- `POST /auth/login` - Login (returns token + user)
- `GET /students` - List students (optional: `?class=CLASS`)
- `GET /skills` - List skills (optional: `?category=CATEGORY`)
- `GET /assessments/student/:studentId` - Get student's skill checks
- `POST /assessments` - Save assessment (body: `{ studentId, skillChecks }`)
- `GET /analytics/heatmap` - Student skills matrix
- `GET /analytics/gap-analysis` - Skill gap report

Auth token stored in `localStorage` and added to all requests via `Authorization: Bearer <token>` header.

## Components

### LoginForm
Email/password login with Zod validation and role detection from API response.

### StudentRoster
Searchable, filterable student list. Select to load their skill checklist.

### SkillChecklistForm
Checkbox indicators for skills. Auto-displays "LULUS" when all completed. Real-time visual state change.

### SkillStatusTabs
Pending vs. completed count tabs with icons.

### AnalyticsHeatmap
Matrix: students (rows) × skills (columns). Green checkmarks for completed, grey circles for pending.

### GapAnalysisReport
Bar chart style skill rankings by completion rate. Color-coded: green (80%+), yellow (50–79%), red (<50%).

## Accessibility

- WCAG AA compliant form labels and error messages
- Semantic HTML structure
- Icon + text labels on buttons
- Keyboard navigation support
- Color + icon for status indicators (not color alone)
- Screen reader friendly component names

## Mobile & Tablet

- **Mobile** (< 1024px): Single column, stacked layout
- **Tablet** (≥ 1024px): 3-column grid (student list, checklist, status)
- Responsive font sizing with TailwindCSS screens
- Touch-friendly button sizing (min 44×44px)

## Demo Credentials

(Mock API responses):
- `guru@example.com` / `password` → Teacher role
- `admin@example.com` / `password` → Admin role
- `student@example.com` / `password` → Student role

All login endpoints return role in user object; routing auto-restricts pages based on role.

## Error Handling

- 401 auto-logout and redirect to `/login`
- Form validation errors display inline
- API errors show toast-style alerts
- Network errors retry via React Query

## Performance

- React Query caches data (staleTime: 5min, gcTime: 10min)
- Lazy route splitting with React Router
- Image optimization via Vite
- CSS tree-shaken by Tailwind PurgeCSS

## Notes

- Vite proxy rewrites `/api/*` to `:8000/api/*`
- Auth token expires client-side on 401; set `localStorage.authToken` to test auth bypass
- Components use controlled forms (React Hook Form) for real-time validation

## License

MIT
