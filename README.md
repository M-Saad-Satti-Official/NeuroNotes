<p align="center">
  <img src="https://z-cdn.chatglm.cn/z-ai/static/logo.svg" alt="NeuroNote Logo" width="64" height="64" />
</p>

<h1 align="center">NeuroNote</h1>

<p align="center">
  <strong>AI-Powered Personal Knowledge OS</strong>
</p>

<p align="center">
  Your second brain, supercharged with AI. Capture notes across 6 content types, organize them in workspaces, auto-generate tags and titles, write code with an IDE-style editor, and manage everything through a beautiful, role-based collaborative interface.
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

## Overview

NeuroNote is a **production-grade Personal Knowledge Management (PKM) application** that helps individuals and teams capture, organize, and retrieve knowledge. Unlike simple note-taking apps, NeuroNote treats knowledge management as an operating system for your thoughts — with structured workspaces (Spaces), intelligent content classification (AI Tags), multi-format support (text, code, images, videos, links, documents), and enterprise-grade access control (RBAC with 14 granular permission keys).

The application is built as a modern single-page application using **Next.js 16 App Router** with a carefully designed service abstraction layer that cleanly separates the UI from data operations, making it straightforward to swap the current mock data layer for any production backend (Firebase, Supabase, or custom API) by modifying only **5 service bridge files** — zero component or store code changes required.

---

## Problem & Solution

### The Problem

Knowledge workers, developers, and teams lose valuable information across scattered tools — browser bookmarks, chat threads, notepad files, and disconnected apps. Existing solutions are either too simple (no structure, no collaboration) or too complex (steep learning curves, expensive subscriptions). Most lack built-in code editing, intelligent content classification, and fine-grained permission controls in a single, cohesive experience.

### The Solution

NeuroNote consolidates all knowledge capture into one interface:

- **6 content types** in one place — text notes, quick captures, images, video references, external links, and documents
- **AI-powered intelligence** — automatic tag generation and title suggestions based on content analysis
- **IDE-class code editing** — insert, edit, and preview code blocks with syntax highlighting for 23+ languages, colored brackets, and a One Dark Pro theme
- **Structured workspaces** — organize notes into color-coded Spaces with visibility controls
- **Voice input** — dictate notes hands-free using the browser's Web Speech API
- **Enterprise RBAC** — 3 roles (Admin, Editor, Viewer) with 14 configurable permission keys and per-role overrides
- **Analytics dashboard** — track note creation trends, type distribution, and space utilization

---

## Features

### Core Notes System
- ✅ Create, edit, delete, and view notes across **6 types**: Text, Quick Note, Image, Video, Link, Document
- ✅ **Pin/unpin** important notes for quick access
- ✅ **Public/private visibility toggle** on individual notes
- ✅ **Full-text search** across note titles, content, and tags with debounced input
- ✅ Sort by **latest, oldest, or alphabetical** order
- ✅ Filter by **tags** and **spaces**
- ✅ **Grid and list view** modes
- ✅ Inline **quick note capture** with ⌘N keyboard shortcut

### AI-Powered Features
- ✅ **AI tag generation** — keyword-based content analysis with 25+ category mappings, generates 3–6 relevant tags
- ✅ **AI title generation** — intelligent first-sentence extraction with capitalization
- 🚧 Real AI integration via `z-ai-web-dev-sdk` (mock currently active; SDK installed and ready)

### Code Block Editor
- ✅ **IDE-style code block insertion** — dialog with live syntax-highlighted preview
- ✅ **Custom token-based syntax highlighter** — supports 23+ languages
- ✅ **Colored brackets**: `()` yellow, `{}` red, `[]` green — bold, non-overlapping tokens
- ✅ **One Dark Pro theme** — traffic-light dots, line numbers, language badge
- ✅ **Inline editing** — double-click to edit code blocks directly in the preview
- ✅ **Auto-detection** — markdown code blocks in note content render automatically as formatted code panels
- ✅ **Copy to clipboard** — one-click code copying from rendered blocks

### Voice Input
- ✅ Browser-native **Web Speech API** dictation
- ✅ Real-time **interim transcript** preview tooltip while recording
- ✅ **Continuous recognition** with auto-restart on silence
- ✅ Error handling with **toast notifications** for permission denial, no speech, and other failures
- ✅ Visual **recording indicator** with pulsing red dot and gradient bar

### Spaces (Workspaces)
- ✅ Create, edit, delete workspaces with **custom name, color, icon, and description**
- ✅ **Public/private visibility** toggle per space
- ✅ **Space filtering** — click a space in the sidebar to view only its notes
- ✅ **Case-insensitive duplicate name detection** on creation
- ✅ Space management accessible from **both Settings and Sidebar**

### Tags
- ✅ **Auto-derived tags** from note content (manual + AI tags combined)
- ✅ **Usage count tracking** per tag
- ✅ **Tag autocomplete** input when editing notes
- ✅ **Tag filtering** — click a tag in the sidebar to filter the notes grid
- ✅ **Searchable tag popover** in the sidebar with active-state indicators

### Authentication & Access Control
- ✅ **Login/Signup** UI with email and password fields
- ✅ **Demo quick-login** buttons (Admin, Editor, Viewer) for instant testing
- ✅ **3-tier RBAC**: Admin, Editor, Viewer with full permission matrix
- ✅ **14 granular permission keys**: canCreateNote, canEditNote, canDeleteOwnNote, canDeleteAnyNote, canPinNotes, canToggleNoteVisibility, canViewOverview, canCreateSpaces, canEditSpaces, canDeleteSpaces, canManageTags, canManageUsers, canViewAdminPanel, canManageAppSettings
- ✅ **Per-role permission overrides** — admins can customize what each role can do beyond defaults
- ✅ **Public signup toggle** — admin can disable self-registration
- ✅ **User suspension/activation** — admins can temporarily disable accounts
- ✅ **Space-level access control** — assign users to spaces as Editor or Viewer

### Admin Panel
- ✅ **User management table** — view all users with role, status, and last login
- ✅ **Role assignment** — change any user's role via dialog
- ✅ **User suspension and activation** — temporary account controls
- ✅ **User deletion** with confirmation dialog
- ✅ **Search and filter** users by name/email and role
- ✅ **Space access management** — assign/remove users from spaces with role selection
- ✅ **Space deletion** from admin panel

### Settings Panel
- ✅ **App-wide configuration**: public signup toggle, default user role, max notes per user
- ✅ **Permission matrix UI** — interactive toggle grid for Editor and Viewer roles across all 14 permission keys, grouped by category (Notes, Spaces, General)
- ✅ **Per-role reset** — one-click revert to default permissions for any role
- ✅ **Space CRUD** — create, edit (name/color/description/visibility), and delete spaces

### Analytics Dashboard (Overview)
- ✅ **4 stat cards**: total notes, public notes, private notes, total tags
- ✅ **7-day activity chart** — animated bar chart showing notes created per day
- ✅ **Notes by Type** — horizontal bar chart with type-specific colors and icons
- ✅ **Notes by Space** — horizontal bar chart with space-matching colors
- ✅ **Additional stats**: pinned notes, notes created (7d), active spaces, average tags per note
- ✅ **Skeleton loading states** for all sections

### Profile Page
- ✅ **Avatar upload** — click-to-upload with drag overlay, image preview, and 5MB size limit
- ✅ **Editable profile fields** — name and email with inline edit mode
- ✅ **Password change form** — current/new/confirm with validation (min 8 chars, match check)
- ✅ **Account metadata display** — role badge, status badge, member since, last login
- ✅ **Danger zone** — logout action with destructive styling

### UI/UX
- ✅ **Dark/light theme** with system preference detection (`next-themes`)
- ✅ **Animated sidebar** — collapsible with smooth width transitions via Framer Motion
- ✅ **Mobile-responsive** — bottom sheet editors, mobile navigation, adaptive layouts
- ✅ **Page transitions** — fade-in and slide-up animations on every view change
- ✅ **Custom scrollbars** — thin, rounded, with hover states for both light and dark themes
- ✅ **Toast notifications** — success, error, warning, and info messages via Sonner
- ✅ **Loading skeletons** — contextual loading states across all pages and tables
- ✅ **Keyboard accessibility** — focus management, ARIA labels, and `sr-only` for screen readers
- ✅ **Premium design** — oklch color system, border-transparency effects, backdrop blur, subtle hover states

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.1 | React framework with App Router, standalone output |
| **React** | 19 | UI component library |
| **TypeScript** | 5 | Type safety across the entire codebase |
| **Tailwind CSS** | 4 | Utility-first styling with oklch color system |
| **shadcn/ui** | 59 components | Pre-built accessible UI components (Radix UI primitives) |
| **Framer Motion** | 12 | Page transitions, animated sidebar, chart animations |
| **Zustand** | 5 | Lightweight state management (5 stores) |
| **React Hook Form** | 7.60 | Form handling with Zod validation |
| **Zod** | 4 | Schema validation for forms and data |
| **Recharts** | 2.15 | Data visualization (charts) |
| **Lucide React** | 0.525 | Consistent icon set (40+ icons used) |
| **Sonner** | 2.0 | Toast notification system |
| **date-fns** | 4.1 | Date formatting and manipulation |
| **next-themes** | 0.4 | Dark/light theme management |

### Backend (Current: Mock Layer)
| Technology | Purpose |
|---|---|
| **In-memory mock services** | 5 service files simulating API calls with 150–600ms delays |
| **Static mock data** | 7 data files: 12 notes, 4 spaces, 6 users, dynamic tags, 6 files, 5 space assignments, 1 app settings object |

### Backend (Planned: Firebase)
| Technology | Purpose |
|---|---|
| **Firebase Auth** | Email/password login, Google OAuth, session persistence |
| **Cloud Firestore** | All structured data: notes, spaces, users, tags, settings, assignments |
| **Firebase Storage** | File uploads: avatars, note image/document attachments |
| **Cloud Functions** | User provisioning, AI tag/title generation, search indexing |
| **Firebase Security Rules** | RBAC enforcement at the database level |

### Development Tools
| Technology | Purpose |
|---|---|
| **Bun** | Runtime and package manager |
| **ESLint** | Code linting (Next.js config) |
| **Prisma** | Database ORM (schema defined; unused with mock layer) |
| **z-ai-web-dev-sdk** | AI SDK for chat completions and image generation |

---

## Architecture

### High-Level Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (ThemeProvider, Toaster, fonts)
│   ├── page.tsx                  # Single-page app (auth gate → NotesApp)
│   ├── globals.css               # Tailwind CSS, oklch theme, custom scrollbars
│   └── api/route.ts              # API route placeholder
├── features/                     # Feature-based modules
│   ├── notes/                    # Notes CRUD, editor, viewer, search, types
│   │   ├── components/           # 14 components (editor, viewer, cards, etc.)
│   │   └── hooks/                # use-notes, use-debounce
│   ├── auth/                     # Authentication page
│   ├── admin/                    # Admin panel (users + space access)
│   ├── overview/                 # Analytics dashboard
│   ├── settings/                 # App settings + permission matrix
│   └── profile/                  # User profile management
├── components/                   # Shared UI
│   ├── layout/                   # Sidebar, Header, MobileNav
│   ├── ui/                       # 59 shadcn/ui components
│   ├── shared/                   # SpaceIcon, etc.
│   └── page-loader.tsx           # App-level loading state
├── store/                        # Zustand state management (5 stores)
│   ├── notes-store.ts            # Notes CRUD, search, sort, filter
│   ├── spaces-store.ts           # Spaces CRUD, current space
│   ├── tags-store.ts             # Tags fetch
│   ├── auth-store.ts             # Auth, permissions, settings, assignments
│   └── ui-store.ts               # UI state (views, editor, modals)
├── services/                     # Service bridge layer (swap point for backend)
│   ├── notes.service.ts          # → delegates to mock
│   ├── spaces.service.ts         # → delegates to mock
│   ├── tags.service.ts           # → delegates to mock
│   ├── auth.service.ts           # → delegates to mock
│   └── ai.service.ts            # → delegates to mock
├── mock/
│   ├── services/                 # Mock service implementations (in-memory)
│   └── data/                     # Static mock data files
├── types/
│   └── index.ts                  # All TypeScript types + RBAC permission system
└── lib/
    ├── utils.ts                  # cn() utility, helpers
    └── db.ts                     # Prisma client (defined, unused)
```

### Data Flow

```
React Components
    ↓ (use stores)
Zustand Stores (5 stores: notes, spaces, tags, auth, ui)
    ↓ (call service methods)
Service Bridge Layer (5 files in src/services/)
    ↓ (delegate 100%)
Mock Services (5 files in src/mock/services/)
    ↓ (read/write)
Mock Data (7 files in src/mock/data/)
```

### Key Design Decisions

1. **Service abstraction layer**: Every service file in `src/services/` is a thin proxy that imports from `src/mock/services/`. To connect a real backend, only these 5 bridge files need modification — no component or store code changes.

2. **RBAC permission system**: The `types/index.ts` file defines 14 permission keys with default values per role. The `getPermissionsForRole()` function computes effective permissions by applying admin-configurable overrides on top of role defaults. This runs entirely on the client and drives all UI permission checks.

3. **Single-page architecture**: The entire app lives in one Next.js page (`page.tsx`) with a client-side view router managed by `ui-store.ts`. Views include: notes, overview, admin, settings, and profile.

4. **Mock data with realistic delays**: All mock services simulate 150–600ms latency to mimic real API behavior, ensuring the UI handles loading states correctly before backend integration.

5. **Custom syntax highlighter**: Rather than importing a heavy library, the code block editor uses a custom token-based parser that handles 7 priority levels (comments → strings → keywords → booleans → numbers → functions → operators → brackets) with overlap detection, producing non-overlapping HTML spans with the One Dark Pro color scheme.

---

## Backend / Data

### Current State: Mock Data Layer

The application currently operates entirely with **in-memory mock data**. No real database or authentication is connected. All data is lost on page refresh. This is intentional — the mock layer provides a fully functional UI for development, demonstration, and investor previews while the backend is being designed.

**What the mock layer provides:**
- 12 pre-populated notes across 6 types with rich content (React, TypeScript, Rust, PostgreSQL, etc.)
- 4 workspaces (Personal, Work, Ideas, Learning)
- 6 users with 3 roles (1 admin, 2 editors, 3 viewers, 1 suspended)
- Dynamic tag derivation from note content
- Simulated 150–600ms API latency
- Suspended user blocking, signup toggle enforcement

**What is NOT persisted:**
- Profile edits (name, email, avatar) — UI-only
- Password changes — no email sent
- File uploads — base64 preview only, no storage
- Session state — page refresh resets everything

### Planned Backend: Firebase

A complete Firebase backend integration plan has been designed and documented in `plan.md`. Key aspects:

- **Firebase Auth** — email/password + Google OAuth with `onAuthStateChanged` session persistence
- **Cloud Firestore** — 7 collections: users, spaces, notes, tags, spaceAssignments, settings (singleton), permissionOverrides (singleton)
- **Firebase Storage** — avatars/{uid} and attachments/{noteId} buckets
- **Security Rules** — RBAC enforcement at the database level, with custom auth token claims for efficient permission checking
- **Cloud Functions** — user provisioning triggers, AI tag/title generation, search indexing

The migration path requires modifying only the **5 service bridge files** in `src/services/` — zero component or store changes.

---

## Project Status

### What Is Working
- Complete note CRUD with 6 content types
- Full RBAC system with 14 permission keys and per-role overrides
- Admin panel with user and space access management
- Settings panel with permission matrix editor
- IDE-style code block editor with custom syntax highlighting (23+ languages)
- Voice input via Web Speech API
- AI tag and title generation (keyword-based mock)
- Analytics dashboard with activity charts
- Dark/light theme with system preference detection
- Collapsible sidebar with space and tag navigation
- Mobile-responsive layout with bottom sheet editors
- Profile page with avatar upload
- Full mock data layer for demonstration

### What Is Incomplete
- No real backend — all data is in-memory mock (page refresh loses everything)
- No session persistence — users must re-login after every refresh
- No real file storage — image/document uploads are base64 only
- AI features use keyword scoring, not real AI models (SDK installed and ready)
- No Google OAuth — only email/password UI exists
- No password reset — email not sent
- No i18n — English only (next-intl installed)
- Prisma schema defined but unused (SQLite placeholder)

---

## Getting Started

### Prerequisites
- **Bun** (recommended) or Node.js 18+
- A terminal / command prompt

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd <project-directory>

# Install dependencies
bun install

# (Optional) Generate Prisma client (not used by mock layer)
bun run db:generate
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

| Button | Role | Capabilities |
|---|---|---|
| **Admin** | Full access | Manage users, spaces, settings, permissions — everything |
| **Editor** | Standard access | Create/edit own notes, manage tags, view overview |
| **Viewer** | Read-only access | View notes and overview, create notes (with overrides) |

The password field accepts any input during demo mode.

---

## Roadmap

### Near-Term (Backend Integration)
- [ ] Firebase project setup and configuration
- [ ] Firebase Auth integration (email/password + Google OAuth)
- [ ] Firestore data layer (notes, spaces, users, tags, settings)
- [ ] Firebase Storage for file uploads (avatars, attachments)
- [ ] Security rules with RBAC enforcement
- [ ] Session persistence via `onAuthStateChanged`
- [ ] Real AI tag and title generation via `z-ai-web-dev-sdk`
- [ ] Mock data removal and service bridge migration

### Mid-Term (Feature Enhancement)
- [ ] Real-time collaboration (WebSocket / Firestore real-time listeners)
- [ ] Rich text editing with MDX Editor (already installed: `@mdxeditor/editor`)
- [ ] Full-text search with Firestore or Algolia
- [ ] Note versioning and revision history
- [ ] Keyboard shortcuts (global command palette)
- [ ] Drag-and-drop note reordering (`@dnd-kit` installed)
- [ ] Export notes as PDF, Markdown, and DOCX
- [ ] Email notifications for mentions and shares
- [ ] Internationalization (i18n) — `next-intl` installed

### Long-Term (Scaling & Platform)
- [ ] Mobile app (React Native or Capacitor)
- [ ] Offline-first mode with service workers
- [ ] Plugin/extension system
- [ ] Public note sharing via shareable links
- [ ] Team billing and usage analytics
- [ ] API for third-party integrations
- [ ] Desktop app (Tauri or Electron)

---

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes following the existing code patterns
4. Test across dark/light themes and mobile/desktop viewports
5. Commit with descriptive messages (`git commit -m 'Add feature X for Y reason'`)
6. Push to your branch (`git push origin feature/your-feature`)
7. Open a Pull Request

**Architecture note**: When adding features that need backend data, add methods to the service bridge files (`src/services/*.ts`) and corresponding mock implementations (`src/mock/services/*.ts`). This keeps the mock layer functional while the real backend is being built.

---

## License

Private — All rights reserved.
