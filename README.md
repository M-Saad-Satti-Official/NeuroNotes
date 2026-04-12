<p align="center">
  <img src="@/public/logo.svg" alt="NeuroNote Logo" width="64" height="64" />
</p>

<h1 align="center">NeuroNote</h1>

<p align="center">
  <strong>AI-Powered Personal Knowledge OS</strong>
</p>

<p align="center">
  Your second brain, supercharged with AI. Capture notes across 6 content types, organize them in workspaces, auto-generate tags and titles, write code with an IDE-style editor, and manage everything through a beautiful, collaborative interface with fine-grained access control.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-38bdf8?logo=tailwindcss" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Zustand-5-orange?logo=zustand" alt="Zustand" />
  <img src="https://img.shields.io/badge/Framer_Motion-12-purple?logo=framer" alt="Framer Motion" />
</p>

---

## What Is NeuroNote?

NeuroNote is a **personal knowledge management application** that helps you capture, organize, and retrieve knowledge. It goes beyond simple note-taking by treating knowledge management as an operating system for your thoughts.

You can create notes in **6 different content types** (text, quick capture, images, videos, external links, and documents), organize them into **color-coded workspaces** called Spaces, and let **AI suggest tags and titles** based on your content. For developers, there is a built-in **IDE-style code editor** with syntax highlighting for 23+ languages, and you can even dictate notes hands-free using **voice input**.

The frontend is fully built and functional. It currently runs with an in-memory mock data layer for demonstration and development purposes, and is designed to be connected to any backend by modifying only **five service bridge files** — no component or store code needs to change.

---

## Key Features

### Notes
- Create, edit, delete, and view notes across **6 types**: Text, Quick Note, Image, Video, Link, Document
- **Pin** important notes for quick access
- Toggle **public/private visibility** on individual notes
- **Full-text search** across titles, content, and tags
- Sort by latest, oldest, or alphabetical order
- Filter by tags and spaces
- Grid and list view modes
- Inline quick note capture with keyboard shortcut

### AI-Powered Intelligence
- **AI tag generation** — content analysis with 25+ category mappings, suggests 3-6 relevant tags
- **AI title generation** — intelligent title suggestion from note content
- Ready for real AI integration via `z-ai-web-dev-sdk` (SDK installed and configured)

### Code Block Editor
- **IDE-style code block insertion** with live syntax-highlighted preview
- Custom token-based syntax highlighter supporting 23+ languages
- **Colored brackets**: `()` yellow, `{}` red, `[]` green — bold, non-overlapping tokens
- **One Dark Pro theme** — traffic-light dots, line numbers, language badge
- Inline editing — double-click to edit code blocks directly in the preview
- Auto-detection of markdown code blocks rendered as formatted panels
- One-click copy to clipboard

### Voice Input
- Browser-native **Web Speech API** dictation
- Real-time interim transcript preview while recording
- Continuous recognition with auto-restart on silence
- Visual recording indicator with pulsing animation

### Spaces (Workspaces)
- Create, edit, delete workspaces with custom name, color, icon, and description
- Public/private visibility toggle per space
- Space filtering in the sidebar
- Duplicate name detection (case-insensitive)

### Tags
- Auto-derived tags from note content (manual + AI tags combined)
- Usage count tracking per tag
- Tag autocomplete when editing notes
- Searchable tag popover in the sidebar

### Access Control
- **3-tier RBAC**: Admin, Editor, Viewer with full permission matrix
- **14 granular permission keys** covering notes, spaces, tags, users, and settings
- Per-role permission overrides customizable by admins
- Public signup toggle, user suspension/activation
- Space-level access control with role assignment

### Admin Panel
- User management table with search and role filtering
- Role assignment, suspension, activation, and deletion
- Space access management — assign/remove users with role selection

### Analytics Dashboard
- 4 stat cards: total notes, public notes, private notes, total tags
- 7-day activity chart with animated bars
- Notes by Type distribution chart
- Notes by Space distribution chart
- Additional stats: pinned count, recent notes, active spaces, avg tags per note

### Profile
- Avatar upload with drag overlay and image preview
- Editable name and email fields
- Password change form with validation
- Account metadata display (role, status, member since, last login)

### UI/UX
- Dark/light theme with system preference detection
- Animated collapsible sidebar with smooth transitions
- Mobile-responsive layout with bottom sheet editors
- Page transitions with fade-in and slide-up animations
- Toast notifications, loading skeletons, and keyboard accessibility

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.1 | React framework with App Router |
| React | 19 | UI component library |
| TypeScript | 5 | Type safety across the entire codebase |
| Tailwind CSS | 4 | Utility-first styling |
| shadcn/ui | 59 components | Pre-built accessible UI components |
| Framer Motion | 12 | Animations and transitions |
| Zustand | 5 | State management (5 stores) |
| React Hook Form | 7.60 | Form handling with validation |
| Zod | 4 | Schema validation |
| Recharts | 2.15 | Data visualization |
| Lucide React | 0.525 | Icon set |
| Sonner | 2.0 | Toast notifications |
| next-themes | 0.4 | Dark/light theme management |

### Backend (Current)
The app currently runs with an **in-memory mock data layer**. All data is generated locally and lost on page refresh. This is intentional — it allows the fully-featured frontend to be demonstrated and developed without requiring any backend setup.

See **[plan.md](./plan.md)** for a complete technology-agnostic backend architecture plan covering data models, API design, storage strategy, authentication options, and three recommended architecture approaches.

### Development Tools
| Technology | Purpose |
|---|---|
| Bun | Runtime and package manager |
| ESLint | Code linting |
| z-ai-web-dev-sdk | AI SDK for chat completions and image generation |
| Prisma | Database ORM (schema defined; unused with mock layer) |

---

## Architecture

### Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (ThemeProvider, Toaster, fonts)
│   ├── page.tsx                  # Single-page app (auth gate → NotesApp)
│   └── globals.css               # Tailwind CSS, theme, custom scrollbars
├── features/                     # Feature-based modules
│   ├── notes/                    # 14 components + 2 hooks
│   ├── auth/                     # Login/signup page
│   ├── admin/                    # Admin panel (users + space access)
│   ├── overview/                 # Analytics dashboard
│   ├── settings/                 # App settings + permission matrix
│   └── profile/                  # User profile management
├── components/                   # Shared UI
│   ├── layout/                   # Sidebar, Header, MobileNav
│   ├── ui/                       # 59 shadcn/ui components
│   └── shared/                   # Shared utilities (SpaceIcon, etc.)
├── store/                        # Zustand stores (5)
│   ├── notes-store.ts            # Notes CRUD, search, sort, filter
│   ├── spaces-store.ts           # Spaces CRUD, current space
│   ├── tags-store.ts             # Tags fetch
│   ├── auth-store.ts             # Auth, permissions, settings
│   └── ui-store.ts               # UI state (views, editor, modals)
├── services/                     # Service bridge layer (backend swap point)
│   ├── notes.service.ts
│   ├── spaces.service.ts
│   ├── tags.service.ts
│   ├── auth.service.ts
│   └── ai.service.ts
├── mock/                         # Mock data layer (to be replaced)
│   ├── services/                 # Mock implementations (in-memory)
│   └── data/                     # Static mock data (7 files)
├── types/
│   └── index.ts                  # All TypeScript types + RBAC system
└── lib/
    ├── utils.ts                  # Utility functions
    └── db.ts                     # Database client (defined, unused)
```

### Data Flow

```
React Components
    ↓
Zustand Stores (5 stores)
    ↓
Service Bridge Layer (5 files)
    ↓
[ Backend — currently mock, to be replaced ]
```

The service bridge layer is the key architectural decision. Each of the five service files is a thin proxy that currently delegates to mock implementations. When connecting a real backend, only these five files need to be rewritten. The stores and components remain completely unchanged.

---

## Current State

### What Is Working (Frontend)
- Complete note CRUD with 6 content types
- Full RBAC system with 14 permission keys and per-role overrides
- Admin panel with user and space access management
- Settings panel with interactive permission matrix
- IDE-style code block editor with 23+ language syntax highlighting
- Voice input via Web Speech API
- AI tag and title generation (keyword-based mock)
- Analytics dashboard with activity charts
- Dark/light theme
- Collapsible sidebar with space and tag navigation
- Mobile-responsive layout
- Profile page with avatar upload

### What Needs a Backend
- **No real database** — all data is in-memory (lost on page refresh)
- **No session persistence** — users must re-login after every refresh
- **No file storage** — image/document uploads are base64 only
- **No real authentication** — any password is accepted
- **No real AI** — tags/titles use keyword scoring, not an actual LLM
- **No password reset** — email is not sent
- **No i18n** — English only

---

## Getting Started

### Prerequisites
- **Bun** (recommended) or Node.js 18+
- A terminal

### Installation

```bash
git clone <repository-url>
cd <project-directory>
bun install
```

### Running the App

```bash
# Start development server on port 3000
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

### Demo Access

Open the app and click one of the three **Quick Demo Login** buttons on the login page:

| Button | Role | What You Can Do |
|---|---|---|
| **Admin** | Full access | Manage users, spaces, settings, permissions — everything |
| **Editor** | Standard access | Create/edit notes, manage tags, view overview |
| **Viewer** | Limited access | View notes and overview, create notes |

The password field accepts any input during demo mode.

---

## Backend Plan

The complete backend architecture plan is documented in **[plan.md](./plan.md)**. It covers:

- **Feature breakdown** — every feature mapped to its backend requirements
- **Data models** — abstract entity definitions (User, Note, Space, Tag, etc.)
- **API design** — 30+ REST endpoints with request/response formats
- **Storage strategy** — what goes in the database vs. object storage
- **Authentication strategy** — 3 options compared (JWT, sessions, third-party)
- **Architecture options** — 3 approaches compared (custom API, BaaS, serverless)

No specific backend technology is prescribed. The plan is designed to help you make an informed decision based on your needs.

---

## Roadmap

### Near-Term (Backend Integration)
- [ ] Choose and set up a backend (see plan.md for options)
- [ ] Implement authentication with session persistence
- [ ] Connect database for notes, spaces, tags, and settings
- [ ] Set up file storage for avatars and note attachments
- [ ] Integrate real AI for tag and title generation
- [ ] Remove mock data layer

### Mid-Term (Feature Enhancement)
- [ ] Rich text editing with MDX Editor (already installed)
- [ ] Full-text search with proper indexing
- [ ] Note versioning and revision history
- [ ] Global command palette (keyboard shortcuts)
- [ ] Drag-and-drop note reordering (`@dnd-kit` installed)
- [ ] Export notes as PDF, Markdown, and DOCX
- [ ] Internationalization (i18n) — `next-intl` installed

### Long-Term (Platform)
- [ ] Mobile app (React Native or Capacitor)
- [ ] Offline-first mode with service workers
- [ ] Public note sharing via shareable links
- [ ] Plugin/extension system
- [ ] Desktop app (Tauri or Electron)

---

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes following the existing code patterns
4. Test across dark/light themes and mobile/desktop viewports
5. Commit with descriptive messages
6. Push to your branch
7. Open a Pull Request

**Important**: When adding features that need backend data, add methods to the service bridge files (`src/services/*.ts`) and corresponding mock implementations (`src/mock/services/*.ts`). This keeps the mock layer functional while the real backend is being built.

---

## License

Private — All rights reserved.
