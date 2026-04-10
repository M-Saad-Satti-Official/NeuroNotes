# NeuroNote — Firebase Backend Integration Plan

> **Version**: 1.0  
> **Date**: 2026-04-09  
> **Scope**: Complete Firebase backend design, Firestore schema, security rules, and step-by-step integration guide to replace all mock data with production-ready Firebase services.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Feature Audit](#2-feature-audit)
3. [Mock Data Analysis](#3-mock-data-analysis)
4. [Firebase Architecture](#4-firebase-architecture)
5. [Database Schema](#5-database-schema)
6. [Authentication Plan](#6-authentication-plan)
7. [Security Rules](#7-security-rules)
8. [Integration Steps](#8-integration-steps)
9. [Mock Removal Plan](#9-mock-removal-plan)
10. [Backend Implementation Checklist](#10-backend-implementation-checklist)

---

## 1. Project Overview

### 1.1 What Is NeuroNote?

NeuroNote is an **AI-Powered Personal Knowledge Management System** (PKM) built as a single-page application. It allows users to create, organize, search, and manage knowledge notes across multiple workspaces called "Spaces." The app supports multiple note types (text, image, video, link, document, quick note), features AI-powered tag and title generation, code block editing with syntax highlighting, voice-to-text input, and a granular role-based access control (RBAC) system.

### 1.2 Target Users

- **Individual knowledge workers** managing personal notes, code snippets, research, and reference material
- **Small teams** collaborating within shared workspaces (Spaces)
- **Organizations** with admin-managed user roles and permission hierarchies

### 1.3 Core Functionality

| Capability | Description |
|---|---|
| Note CRUD | Create, read, update, delete notes across 6 types |
| Spaces | Workspace organization with visibility control (public/private) |
| Tags | Manual + AI-generated tags with usage counting |
| Search | Full-text search across notes with debounce |
| RBAC | 3 roles (admin/editor/viewer) with 14 granular permission keys |
| AI Features | AI tag suggestions, AI title generation (keyword-based mock → real AI) |
| Code Blocks | IDE-style code editor with syntax highlighting (23 languages) |
| Voice Input | Browser Web Speech API for dictation |
| Profile | Avatar upload, editable name/email, password change |
| Admin Panel | User management, space access management, role assignment |
| Settings | App-wide configuration (signup toggle, default role, permission overrides) |
| Overview | Analytics dashboard with note type distribution, space stats, activity charts |

### 1.4 Current Architecture

```
Components (React)
    ↓ consume
Zustand Stores (5 stores)
    ↓ call
Service Layer (5 bridge files)
    ↓ delegate 100% to
Mock Services (5 files, in-memory)
    ↓ read from
Mock Data (7 static files)
```

**Critical observation**: Every service file in `src/services/` is a thin proxy that imports and re-exports functions from `src/mock/services/`. This means swapping to Firebase requires modifying **only the 5 service files** — no component or store code needs to change.

### 1.5 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1 (App Router) |
| Language | TypeScript 5 |
| UI | Tailwind CSS 4 + shadcn/ui (59 components) |
| State | Zustand 5 |
| Animation | Framer Motion 12 |
| Charts | Recharts |
| Forms | React Hook Form + Zod 4 |
| Auth (planned) | Firebase Auth |
| Database (planned) | Firestore |
| Storage (planned) | Firebase Storage |
| AI | z-ai-web-dev-sdk (already installed) |
| Runtime | Bun |

---

## 2. Feature Audit

### 2.1 Authentication

| Feature | Status | Data Source |
|---|---|---|
| Login (email/password) | UI only — any password accepted | `auth.service.mock.ts` |
| Signup | UI only — respects `publicSignupEnabled` setting | `auth.service.mock.ts` |
| Demo quick-login (3 buttons) | Functional — hardcoded credentials | `auth-page.tsx` |
| Logout | Functional — clears store | `auth.service.mock.ts` |
| Session persistence | None — page refresh resets state | N/A |
| Google OAuth | Not implemented | N/A |
| Password reset | UI only — no real email sent | `profile-page.tsx` |
| Role-based access (admin/editor/viewer) | Fully functional via `getPermissionsForRole()` | `types/index.ts` + `auth-store.ts` |

### 2.2 Notes

| Feature | Status | Data Source |
|---|---|---|
| Create note (6 types) | Fully functional | `notes.service.mock.ts` |
| Edit note | Fully functional | `notes.service.mock.ts` |
| Delete note | Fully functional + confirm dialog | `notes.service.mock.ts` |
| Pin/unpin note | Fully functional | `notes.service.mock.ts` |
| Public/private toggle | Fully functional | `notes.service.mock.ts` |
| Search notes | Fully functional (title/content/tags match) | `notes.service.mock.ts` |
| Sort (latest/oldest/alphabetical) | Fully functional (client-side) | `notes-store.ts` |
| Filter by tag | Fully functional (client-side) | `notes-store.ts` |
| Filter by space | Fully functional (client-side) | `notes-store.ts` |
| Grid/list view | Fully functional (client-side) | `notes-store.ts` |
| Note type-specific editors | Fully functional (image/video/link/document) | `type-editors.tsx` |
| AI tag generation | Functional — keyword-based scoring mock | `ai.service.mock.ts` |
| AI title generation | Functional — first sentence extraction mock | `ai.service.mock.ts` |
| Code block editor | Fully functional — custom syntax highlighter | `code-block-editor.tsx` |
| Code block insert dialog | Fully functional — IDE-style live preview | `code-block-insert-dialog.tsx` |
| Voice input | Functional — Web Speech API (browser-native) | `voice-input.tsx` |
| Quick note capture | Fully functional | `quick-note-input.tsx` |
| Inline code preview | Fully functional — auto-renders markdown code blocks | `note-editor.tsx` |

### 2.3 Spaces

| Feature | Status | Data Source |
|---|---|---|
| Create space | Fully functional | `spaces.service.mock.ts` |
| Edit space | Fully functional | `spaces.service.mock.ts` |
| Delete space | Fully functional | `spaces.service.mock.ts` |
| Toggle visibility | Fully functional | `spaces.service.mock.ts` |
| Space assignments | Fully functional | `auth.service.mock.ts` |
| Space filtering | Fully functional (client-side) | `spaces-store.ts` |

### 2.4 Tags

| Feature | Status | Data Source |
|---|---|---|
| Tag list with usage counts | Fully functional — derived from notes | `tags.service.mock.ts` |
| Tag autocomplete | Fully functional (client-side) | `tag-input.tsx` |
| Tag filtering | Fully functional (client-side) | `notes-store.ts` |

### 2.5 Admin & Settings

| Feature | Status | Data Source |
|---|---|---|
| User management (role/suspend/delete) | Fully functional | `auth.service.mock.ts` |
| Space access management | Fully functional | `auth.service.mock.ts` |
| App settings (signup toggle, default role) | Fully functional | `auth.service.mock.ts` |
| Permission overrides per role | Fully functional | `auth.service.mock.ts` |
| Overview dashboard (stats/charts) | Fully functional — computed from notes | `notes-store.ts` |

### 2.6 Profile

| Feature | Status | Data Source |
|---|---|---|
| View profile | Fully functional | `auth-store.ts` |
| Edit name/email | UI only — no persistence | `profile-page.tsx` |
| Avatar upload | UI only — FileReader/base64 (no storage) | `profile-page.tsx` |
| Password change | UI only — no persistence | `profile-page.tsx` |

### 2.7 File Handling

| Feature | Status | Data Source |
|---|---|---|
| Image upload (note attachment) | UI only — base64 in content | `type-editors.tsx` |
| Document upload | UI only — base64 in content (50MB limit) | `type-editors.tsx` |
| Video URL embedding | Fully functional — YouTube/Vimeo extraction | `type-editors.tsx` |
| Link preview | Fully functional — URL display | `type-editors.tsx` |
| Avatar upload | UI only — base64 preview only | `profile-page.tsx` |

---

## 3. Mock Data Analysis

### 3.1 Mock Data Files

#### `src/mock/data/notes.mock.ts` (173 lines)
- **12 pre-populated notes** with rich content covering React, TypeScript, Rust, PostgreSQL, etc.
- Structure: `{ id, title, content, noteType, manualTags, aiTags, spaceId, visibility, createdBy, createdAt, updatedAt, isPinned }`
- Content includes markdown code blocks (```javascript, ```python)
- Used by: `notes.service.mock.ts`

#### `src/mock/data/spaces.mock.ts` (41 lines)
- **4 spaces**: Personal, Work, Ideas, Learning
- Structure: `{ id, name, description, icon, color, visibility, createdAt }`
- Used by: `spaces.service.mock.ts`

#### `src/mock/data/users.mock.ts` (65 lines)
- **6 users**: 1 admin, 2 editors, 3 viewers (1 suspended)
- Structure: `{ id, name, email, role, status, avatar, createdAt, lastLogin }`
- Used by: `auth.service.mock.ts`

#### `src/mock/data/tags.mock.ts` (22 lines)
- **Derived dynamically** from `notes.mock.ts` — extracts and counts all manualTags + aiTags
- Structure: `{ id, name, usageCount, createdAt }`
- Used by: `tags.service.mock.ts`

#### `src/mock/data/files.mock.ts` (59 lines)
- **6 mock file entries** (PNG, TypeScript, PDF, CSV, Markdown)
- Structure: `{ id, noteId, fileName, fileUrl, fileType, fileSize, createdAt }`
- Used by: `type-editors.tsx` (note viewer renders files from this)

#### `src/mock/data/space-assignments.mock.ts` (35 lines)
- **5 assignments** linking users to spaces with roles
- Structure: `{ userId, spaceId, role, assignedAt }`
- Used by: `auth.service.mock.ts`

#### `src/mock/data/app-settings.mock.ts` (13 lines)
- **1 default settings object**
- Structure: `{ publicSignupEnabled, defaultUserRole, maxNotesPerUser, rolePermissionOverrides }`
- Used by: `auth.service.mock.ts`

### 3.2 Mock Service Files

| File | Functions | Behavior |
|---|---|---|
| `notes.service.mock.ts` (167 lines) | `getNotes`, `getNoteById`, `createNote`, `updateNote`, `deleteNote`, `togglePin`, `toggleVisibility`, `getOverviewStats`, `searchNotes` | In-memory array with 150-600ms simulated delay |
| `auth.service.mock.ts` (180 lines) | `login`, `signup`, `logout`, `getCurrentUser`, `getAllUsers`, `getUserById`, `updateUserRole`, `suspendUser`, `activateUser`, `deleteUser`, `getAppSettings`, `updateAppSettings`, `getRolePermissionOverrides`, `updateRolePermissionOverrides`, `getSpaceAssignments`, `assignUserToSpace`, `removeUserFromSpace`, `getUserSpaceAssignments` | In-memory users array, checks `publicSignupEnabled`, enforces suspended user blocking |
| `spaces.service.mock.ts` (74 lines) | `getSpaces`, `getSpaceById`, `createSpace`, `updateSpace`, `deleteSpace`, `toggleSpaceVisibility` | In-memory array, unique name enforcement (case-insensitive) |
| `tags.service.mock.ts` (84 lines) | `getTags`, `createTag`, `deleteTag` | Derived from notes store in real-time, no independent persistence |
| `ai.service.mock.ts` (66 lines) | `generateTags`, `generateTitle` | Keyword scoring with 25+ category mappings, returns top 3-6 tags; title extracts first sentence |

### 3.3 Service Bridge Layer

Every file in `src/services/` follows an identical pattern:

```typescript
import * as mockService from '@/mock/services/xxx.service.mock';

export const xxxService = {
  methodA: mockService.methodA,
  methodB: mockService.methodB,
  // ... all methods delegate to mock
};
```

**This is the exact swap point for Firebase integration.** Only these 5 files need to change.

### 3.4 Data Currently Stored as Base64 in Note Content

The following note types store binary data directly in the `content` field as base64 or JSON strings:

| Note Type | Content Format | Size |
|---|---|---|
| `image` | `data:image/<type>;base64,<data>` or URL string | Up to 10MB |
| `document` | JSON `{ fileName, fileType, fileSize, data: base64 }` | Up to 50MB |
| `video` | YouTube/Vimeo URL string | ~100 chars |
| `link` | URL string + description text | ~500 chars |
| `text` / `quick` | Plain text + markdown code blocks | Variable |

**Firebase concern**: Firestore documents have a **1MB limit**. Image and document base64 data MUST move to Firebase Storage. Video URLs and link URLs are fine in Firestore.

---

## 4. Firebase Architecture

### 4.1 Firebase Services to Use

| Firebase Service | Purpose | Priority |
|---|---|---|
| **Firebase Authentication** | User login/signup, session management, Google OAuth | Critical |
| **Cloud Firestore** | All structured data (notes, spaces, users, tags, settings) | Critical |
| **Firebase Storage** | File uploads (avatars, note images, documents) | Critical |
| **Cloud Functions** (optional) | AI tag/title generation, search indexing, notification triggers | Medium |
| **Firebase App Check** | Request authentication for API security | Low |

### 4.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Components│  │ Zustand  │  │ Services │  │   Hooks  │    │
│  │  (React) │→│  Stores  │→│ (bridge) │→│  (toast) │    │
│  └──────────┘  └──────────┘  └────┬─────┘  └──────────┘    │
│                                    │                         │
│                     ┌──────────────┼──────────────┐         │
│                     │   Firebase SDK (client)      │         │
│                     └──────────────┼──────────────┘         │
└──────────────────────────────────────┼──────────────────────┘
                                       │
          ┌────────────────────────────┼─────────────────────────┐
          │                            │                          │
          ▼                            ▼                          ▼
┌─────────────┐            ┌──────────────────┐         ┌──────────────┐
│ Firebase    │            │ Cloud Firestore  │         │   Firebase   │
│ Auth        │            │                  │         │   Storage    │
│             │            │ notes/{id}       │         │              │
│ • Email/    │            │ spaces/{id}      │         │ avatars/     │
│   Password  │            │ users/{uid}      │         │   {uid}.*    │
│ • Google    │            │ settings/doc     │         │ attachments/ │
│ • Session   │            │ tags/{id}        │         │   {noteId}.* │
│   tokens   │            │                 │         │              │
└─────────────┘            └────────┬─────────┘         └──────────────┘
                                     │
                            ┌────────┴─────────┐
                            │ Security Rules   │
                            │ (RBAC enforced)  │
                            └──────────────────┘
```

### 4.3 Package Installation

```bash
# Remove Prisma (no longer needed with Firebase)
bun remove prisma @prisma/client

# Install Firebase
bun add firebase
```

### 4.4 Environment Variables

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=neuronote-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=neuronote-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=neuronote-xxxxx.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Firebase Admin (server-side only, for Cloud Functions)
FIREBASE_PROJECT_ID=neuronote-xxxxx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@neuronote-xxxxx.iam.gserviceaccount.com
```

---

## 5. Database Schema

### 5.1 Firestore Collections Overview

```
users/{uid}
spaces/{spaceId}
notes/{noteId}
tags/{tagId}
spaceAssignments/{assignmentId}
settings/appConfig        (singleton document)
permissionOverrides/appConfig (singleton document)
```

### 5.2 Collection: `users/{uid}`

| Field | Type | Required | Description |
|---|---|---|---|
| `uid` | string (document ID) | Yes | Firebase Auth UID |
| `email` | string | Yes | User email (lowercase) |
| `name` | string | No | Display name |
| `role` | string | Yes | `admin` / `editor` / `viewer` |
| `status` | string | Yes | `active` / `suspended` |
| `avatarUrl` | string | No | Firebase Storage URL |
| `createdAt` | timestamp | Yes | Account creation time |
| `updatedAt` | timestamp | Yes | Last profile update |
| `lastLogin` | timestamp | No | Last login time |
| `notesCount` | number | Yes | Denormalized count (for admin) |
| `maxNotesPerUser` | number | Yes | From app settings at creation time |

**Indexes**: `email` (unique), `role`, `status`

```javascript
// Example document
{
  uid: "firebase-uid-001",
  email: "alex@neuronote.app",
  name: "Alex Johnson",
  role: "admin",
  status: "active",
  avatarUrl: "gs://neuronote-xxxxx.appspot.com/avatars/uid-001/photo.jpg",
  createdAt: Timestamp.fromDate(new Date("2025-01-15")),
  updatedAt: Timestamp.fromDate(new Date("2026-04-09")),
  lastLogin: Timestamp.fromDate(new Date("2026-04-09")),
  notesCount: 12,
  maxNotesPerUser: 1000
}
```

### 5.3 Collection: `spaces/{spaceId}`

| Field | Type | Required | Description |
|---|---|---|---|
| `spaceId` | string (document ID) | Yes | Auto-generated |
| `name` | string | Yes | Space name |
| `description` | string | No | Space description |
| `icon` | string | Yes | Lucide icon name |
| `color` | string | Yes | Hex color (#6366f1) |
| `visibility` | string | Yes | `public` / `private` |
| `createdBy` | string | Yes | User UID who created it |
| `createdAt` | timestamp | Yes | Creation time |
| `updatedAt` | timestamp | Yes | Last update |
| `notesCount` | number | Yes | Denormalized count |
| `membersCount` | number | Yes | Denormalized count |

**Indexes**: `createdBy`, `visibility`, `name`

```javascript
{
  spaceId: "space-001",
  name: "Personal",
  description: "My personal knowledge base",
  icon: "User",
  color: "#6366f1",
  visibility: "private",
  createdBy: "firebase-uid-001",
  createdAt: Timestamp.fromDate(new Date("2025-01-15")),
  updatedAt: Timestamp.fromDate(new Date("2026-03-20")),
  notesCount: 5,
  membersCount: 1
}
```

### 5.4 Collection: `notes/{noteId}`

| Field | Type | Required | Description |
|---|---|---|---|
| `noteId` | string (document ID) | Yes | Auto-generated (UUID) |
| `title` | string | Yes | Note title |
| `content` | string | Yes | Text content (text/quick/link types) |
| `noteType` | string | Yes | `text` / `image` / `video` / `link` / `document` / `quick` |
| `manualTags` | string[] | Yes | User-added tags (lowercase) |
| `aiTags` | string[] | Yes | AI-generated tags (lowercase) |
| `spaceId` | string | No | Reference to `spaces/{spaceId}` |
| `visibility` | string | Yes | `public` / `private` |
| `createdBy` | string | Yes | User UID |
| `createdAt` | timestamp | Yes | Creation time |
| `updatedAt` | timestamp | Yes | Last update |
| `isPinned` | boolean | Yes | Whether pinned |
| `attachmentUrl` | string | No | Firebase Storage URL (for image/document types) |
| `attachmentType` | string | No | MIME type of attachment |
| `attachmentSize` | number | No | File size in bytes |

**Content storage strategy by note type:**

| Note Type | `content` field | `attachmentUrl` field |
|---|---|---|
| `text` / `quick` | Plain text + markdown (no size concern) | null |
| `link` | URL + description text | null |
| `video` | YouTube/Vimeo URL + notes text | null |
| `image` | Caption/description text | Firebase Storage URL |
| `document` | Metadata description | Firebase Storage URL |

**Indexes**: 
- `createdBy` + `createdAt` (descending) — user's notes sorted by date
- `spaceId` + `createdAt` (descending) — space notes sorted by date
- `noteType` — filter by type
- `visibility` — public notes filter
- `isPinned` + `createdAt` — pinned notes first
- `manualTags` (array-contains) — tag filtering
- Composite: `createdBy` + `spaceId` + `isPinned` — efficient space+pin queries

```javascript
// Text note example
{
  noteId: "note-001",
  title: "React Server Components Deep Dive",
  content: "# React Server Components\n\nRSC allow you to...",
  noteType: "text",
  manualTags: ["react", "server-components", "performance"],
  aiTags: ["frontend", "framework"],
  spaceId: "space-001",
  visibility: "public",
  createdBy: "firebase-uid-001",
  createdAt: Timestamp.fromDate(new Date("2026-03-15T10:30:00Z")),
  updatedAt: Timestamp.fromDate(new Date("2026-03-20T14:00:00Z")),
  isPinned: true,
  attachmentUrl: null,
  attachmentType: null,
  attachmentSize: null
}

// Image note example
{
  noteId: "note-002",
  title: "Architecture Diagram",
  content: "System architecture overview for v2.0",
  noteType: "image",
  manualTags: ["architecture", "diagram"],
  aiTags: ["design", "planning"],
  spaceId: "space-002",
  visibility: "private",
  createdBy: "firebase-uid-001",
  createdAt: Timestamp.fromDate(new Date("2026-04-01T09:00:00Z")),
  updatedAt: Timestamp.fromDate(new Date("2026-04-01T09:00:00Z")),
  isPinned: false,
  attachmentUrl: "gs://neuronote.appspot.com/attachments/note-002/architecture.png",
  attachmentType: "image/png",
  attachmentSize: 2458624
}
```

### 5.5 Collection: `tags/{tagId}`

| Field | Type | Required | Description |
|---|---|---|---|
| `tagId` | string (document ID) | Yes | Auto from tag name slug |
| `name` | string | Yes | Tag name (lowercase) |
| `usageCount` | number | Yes | How many notes use this tag |
| `createdAt` | timestamp | Yes | First use |
| `lastUsedAt` | timestamp | Yes | Most recent use |

**Note**: Tags are created/updated as side effects of note creation/update. When a note's `manualTags` or `aiTags` change, a Cloud Function (or client-side logic) updates the corresponding tag documents.

```javascript
{
  tagId: "react",
  name: "react",
  usageCount: 3,
  createdAt: Timestamp.fromDate(new Date("2026-01-20T08:00:00Z")),
  lastUsedAt: Timestamp.fromDate(new Date("2026-04-08T16:00:00Z"))
}
```

### 5.6 Collection: `spaceAssignments/{assignmentId}`

| Field | Type | Required | Description |
|---|---|---|---|
| `assignmentId` | string (document ID) | Yes | Auto-generated |
| `userId` | string | Yes | User UID |
| `spaceId` | string | Yes | Space ID |
| `role` | string | Yes | `editor` / `viewer` |
| `assignedBy` | string | Yes | Admin UID who assigned |
| `assignedAt` | timestamp | Yes | Assignment time |

**Indexes**: `userId` + `spaceId` (composite), `spaceId`

```javascript
{
  assignmentId: "assign-001",
  userId: "firebase-uid-002",
  spaceId: "space-002",
  role: "editor",
  assignedBy: "firebase-uid-001",
  assignedAt: Timestamp.fromDate(new Date("2026-02-01T10:00:00Z"))
}
```

### 5.7 Collection: `settings/appConfig` (Singleton)

| Field | Type | Required | Description |
|---|---|---|---|
| `publicSignupEnabled` | boolean | Yes | Allow public registration |
| `defaultUserRole` | string | Yes | Default role for new users |
| `maxNotesPerUser` | number | Yes | Per-user note limit |
| `updatedAt` | timestamp | Yes | Last settings update |
| `updatedBy` | string | Yes | Admin UID who updated |

```javascript
// Document ID: "appConfig"
{
  publicSignupEnabled: true,
  defaultUserRole: "viewer",
  maxNotesPerUser: 1000,
  updatedAt: Timestamp.fromDate(new Date("2026-01-01T00:00:00Z")),
  updatedBy: "firebase-uid-001"
}
```

### 5.8 Collection: `permissionOverrides/appConfig` (Singleton)

| Field | Type | Required | Description |
|---|---|---|---|
| `admin` | map | Yes | `{ canCreateNote: true, ... }` or `{}` for defaults |
| `editor` | map | Yes | Permission overrides for editor role |
| `viewer` | map | Yes | Permission overrides for viewer role |
| `updatedAt` | timestamp | Yes | Last update |
| `updatedBy` | string | Yes | Admin UID |

```javascript
// Document ID: "appConfig"
{
  admin: {},
  editor: {
    canDeleteOwnNote: true,
    canToggleNoteVisibility: true
  },
  viewer: {},
  updatedAt: Timestamp.fromDate(new Date("2026-03-01T12:00:00Z")),
  updatedBy: "firebase-uid-001"
}
```

### 5.9 Firebase Storage Buckets

```
avatars/{uid}/{filename}            — User profile pictures
attachments/{noteId}/{filename}      — Note image/document attachments
```

**Storage rules**: Authenticated users only; avatar can only be written by the same user; attachments can only be written by the note creator or admin.

---

## 6. Authentication Plan

### 6.1 Auth Methods

| Method | Implementation | Priority |
|---|---|---|
| Email/Password | `createUserWithEmailAndPassword` / `signInWithEmailAndPassword` | Critical (Phase 1) |
| Google OAuth | `signInWithPopup(googleAuthProvider)` | Medium (Phase 2) |
| Session persistence | `onAuthStateChanged` listener + Firestore UID lookup | Critical (Phase 1) |
| Password reset | `sendPasswordResetEmail` | Medium (Phase 2) |

### 6.2 User Creation Flow

```
1. User signs up (email + password) or logs in via Google OAuth
2. Firebase Auth creates/updates the auth account
3. A Firestore trigger (Cloud Function) creates/updates the `users/{uid}` document:
   - On first login: create user doc with default role from settings
   - On subsequent login: update `lastLogin` and `notesCount`
4. Client reads `users/{uid}` to populate `auth-store`
5. Client reads `spaceAssignments` to compute `permissions` via `getPermissionsForRole()`
6. Client reads `settings/appConfig` and `permissionOverrides/appConfig` for admin features
```

### 6.3 Session Management

```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Session persistence
auth.setPersistence(browserLocalPersistence); // Persist across tabs
```

### 6.4 Role Assignment Logic

- **New user**: Role = `settings.appConfig.defaultUserRole` (default: `viewer`)
- **Role changes**: Only admins can change roles (enforced by security rules)
- **Suspended users**: Firebase Auth account exists but `users/{uid}.status = 'suspended'`; login succeeds but app blocks access
- **Deleted users**: Firebase Auth account deleted, `users/{uid}` document deleted, all `spaceAssignments` removed

---

## 7. Security Rules

### 7.1 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isAdmin() {
      return getUserRole() == 'admin';
    }

    function isActiveUser() {
      return isAuthenticated() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.status == 'active';
    }

    function canCreateNotes() {
      let perms = get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions;
      return perms.canCreateNote == true;
    }

    // ─── Users ───────────────────────────────────────────
    match /users/{userId} {
      // Anyone authenticated can read user profiles
      allow read: if isAuthenticated() && isActiveUser();
      // Only admins or the user themselves can write
      allow write: if isAuthenticated() && (isAdmin() || isOwner(userId));
      // Block delete for self (only admin can delete)
      allow delete: if isAuthenticated() && isAdmin() && !isOwner(userId);
    }

    // ─── Notes ───────────────────────────────────────────
    match /notes/{noteId} {
      // Read: own notes, public notes, or notes in accessible spaces
      allow read: if isAuthenticated() && isActiveUser()
        && (
          resource.data.createdBy == request.auth.uid  // own notes
          || resource.data.visibility == 'public'       // public notes
        );
      // Create: authenticated active users with permission
      allow create: if isAuthenticated() && isActiveUser()
        && request.resource.data.createdBy == request.auth.uid
        && request.resource.data.noteType in ['text', 'image', 'video', 'link', 'document', 'quick']
        && request.resource.data.visibility in ['public', 'private'];

      // Update: only creator or admin
      allow update: if isAuthenticated() && isActiveUser()
        && (
          resource.data.createdBy == request.auth.uid
          || isAdmin()
        );
      // Delete: only creator (own notes) or admin (any note)
      allow delete: if isAuthenticated() && isActiveUser()
        && (
          resource.data.createdBy == request.auth.uid
          || isAdmin()
        );
    }

    // ─── Spaces ──────────────────────────────────────────
    match /spaces/{spaceId} {
      allow read: if isAuthenticated() && isActiveUser();
      allow create: if isAuthenticated() && isActiveUser();
      // Update/delete: only creator or admin
      allow update: if isAuthenticated() && isActiveUser()
        && (
          resource.data.createdBy == request.auth.uid
          || isAdmin()
        );
      allow delete: if isAuthenticated() && isAdmin();
    }

    // ─── Tags ────────────────────────────────────────────
    match /tags/{tagId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && isActiveUser();
    }

    // ─── Space Assignments ───────────────────────────────
    match /spaceAssignments/{assignmentId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isAdmin();
      allow update: if isAuthenticated() && isAdmin();
      allow delete: if isAuthenticated() && isAdmin();
    }

    // ─── Settings (singleton) ───────────────────────────
    match /settings/{docId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && isAdmin();
    }

    // ─── Permission Overrides (singleton) ────────────────
    match /permissionOverrides/{docId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && isAdmin();
    }
  }
}
```

### 7.2 Firebase Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // User avatars — only the user themselves can read/write their own
    match /avatars/{uid}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && request.auth.uid == uid
        && request.resource.size < 5 * 1024 * 1024  // 5MB max
        && request.resource.contentType.matches('image/.*');
    }

    // Note attachments — creator or admin can write; anyone authenticated can read
    match /attachments/{noteId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && (request.auth.uid == resource.metadata.createdBy || isAdmin());
    }
  }

  // Helper (not available in storage rules, use workaround)
  function isAdmin() {
    return request.auth != null;
    // Note: In storage rules, we cannot call Firestore.
    // Instead, check a custom token claim set via Cloud Function.
    return request.auth.token.admin == true;
  }
}
```

### 7.3 Custom Auth Token Claims

To avoid excessive Firestore reads in security rules, set custom claims on sign-up and role change:

```typescript
// Cloud Function: onCreateUser
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const onCreateUser = functions.auth.user().beforeCreate(async (user) => {
  const settings = await admin.firestore().doc('settings/appConfig').get();
  const defaultRole = settings.data()?.defaultUserRole ?? 'viewer';

  await admin.auth().setCustomUserClaims(user.uid, {
    role: defaultRole,
    status: 'active',
  });
});

// Cloud Function: onRoleChange
export const updateUserClaims = functions.firestore
  .document('users/{uid}')
  .onWrite(async (change, context) => {
    const after = change.after.data();
    if (!after) return;

    await admin.auth().setCustomUserClaims(context.params.uid, {
      role: after.role,
      status: after.status,
    });
  });
```

---

## 8. Integration Steps

### 8.1 Phase 1: Firebase Setup & Auth (Days 1-2)

**Step 1.1**: Create Firebase project in Firebase Console
- Enable Authentication → Email/Password provider
- Enable Authentication → Google provider
- Create Firestore database (start in production mode)
- Create Storage bucket
- Download service account key for admin SDK

**Step 1.2**: Create `src/lib/firebase.ts`

```typescript
// src/lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
}
```

**Step 1.3**: Create `src/lib/firebase-admin.ts` (server-side only)

```typescript
// src/lib/firebase-admin.ts
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

const adminApp = getApps().length === 0
  ? initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    })
  : getApps()[0];

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
export const adminStorage = getStorage(adminApp);
```

**Step 1.4**: Rewrite `src/services/auth.service.ts`

```typescript
// src/services/auth.service.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, getDocs, query, where,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User, Role, LoginCredentials, SignupCredentials, AppSettings, SpaceAssignment, RolePermissionOverrides } from '@/types';

// ─── Auth ───────────────────────────────────────────
export async function login(credentials: LoginCredentials): Promise<User | null> {
  const result = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
  const userDoc = await getDoc(doc(db, 'users', result.user.uid));
  if (!userDoc.exists()) return null;
  const data = userDoc.data();
  return { ...data, id: result.user.uid, createdAt: data.createdAt?.toDate(), updatedAt: data.updatedAt?.toDate(), lastLogin: data.lastLogin?.toDate() };
}

export async function signup(credentials: SignupCredentials): Promise<User | null> {
  // Check if signup is enabled
  const settingsDoc = await getDoc(doc(db, 'settings', 'appConfig'));
  const settings = settingsDoc.data() as AppSettings | undefined;
  if (settings && !settings.publicSignupEnabled) {
    throw new Error('Public signup is disabled');
  }

  const result = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
  const uid = result.user.uid;

  await setDoc(doc(db, 'users', uid), {
    uid,
    email: credentials.email.toLowerCase(),
    name: credentials.name,
    role: settings?.defaultUserRole ?? 'viewer',
    status: 'active',
    avatarUrl: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
    notesCount: 0,
    maxNotesPerUser: settings?.maxNotesPerUser ?? 1000,
  });

  const userDoc = await getDoc(doc(db, 'users', uid));
  const data = userDoc.data()!;
  return { ...data, id: uid, createdAt: data.createdAt?.toDate(), updatedAt: data.updatedAt?.toDate(), lastLogin: data.lastLogin?.toDate() };
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function getCurrentUser(): Promise<User | null> {
  if (!auth.currentUser) return null;
  const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
  if (!userDoc.exists()) return null;
  const data = userDoc.data();
  return { ...data, id: auth.currentUser.uid, createdAt: data.createdAt?.toDate(), updatedAt: data.updatedAt?.toDate(), lastLogin: data.lastLogin?.toDate() };
}

// ... (remaining functions follow same pattern)
```

**Step 1.5**: Update `auth-store.ts` — replace mock imports with real Firebase calls, add `onAuthStateChanged` listener for session persistence

### 8.2 Phase 2: Firestore Data Layer (Days 3-5)

**Step 2.1**: Rewrite `src/services/notes.service.ts`

```typescript
// Key patterns for all Firestore service methods:

export async function getNotes(): Promise<Note[]> {
  const user = auth.currentUser;
  if (!user) return [];
  const q = query(
    collection(db, 'notes'),
    where('createdBy', '==', user.uid),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  }));
}

export async function createNote(data: Partial<Note>): Promise<Note> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const docRef = doc(collection(db, 'notes'));
  await setDoc(docRef, {
    ...data,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isPinned: false,
  });
  return { id: docRef.id, ...data } as Note;
}
```

**Step 2.2**: Rewrite `src/services/spaces.service.ts` — same Firestore CRUD pattern

**Step 2.3**: Rewrite `src/services/tags.service.ts` — client-side tag derivation from notes OR Firestore collection query

**Step 2.4**: Update `notes-store.ts` to handle Firestore timestamps (`Timestamp.toDate()`) instead of native `Date` objects. Add `mapTimestamps` utility:

```typescript
function mapTimestamps(doc: any): Note {
  return {
    ...doc,
    createdAt: doc.createdAt?.toDate?.() ?? new Date(),
    updatedAt: doc.updatedAt?.toDate?.() ?? new Date(),
    lastLogin: doc.lastLogin?.toDate?.() ?? undefined,
  };
}
```

### 8.3 Phase 3: File Uploads (Days 6-7)

**Step 3.1**: Rewrite file upload in `type-editors.tsx` to use Firebase Storage instead of base64

```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

async function uploadAttachment(noteId: string, file: File): Promise<string> {
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storageRef = ref(storage, `attachments/${noteId}/${sanitizedName}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
```

**Step 3.2**: Update profile avatar upload to use Firebase Storage

```typescript
async function uploadAvatar(uid: string, file: File): Promise<string> {
  const storageRef = ref(storage, `avatars/${uid}/${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  // Also update user doc
  await updateDoc(doc(db, 'users', uid), { avatarUrl: url });
  return url;
}
```

**Step 3.3**: Update note viewer (`note-viewer.tsx`) to render `attachmentUrl` instead of parsing base64 from content

### 8.4 Phase 4: AI Features (Days 8-9)

**Step 4.1**: Rewrite `src/services/ai.service.ts` to use real AI via `z-ai-web-dev-sdk`

```typescript
// src/services/ai.service.ts — server-side API route

// Option A: Client-side (via API route)
// src/app/api/ai/generate-tags/route.ts
import ZAI from 'z-ai-web-dev-sdk';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { content } = await req.json();
  const zai = await ZAI.create();
  const response = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: 'Generate 3-6 relevant tags for the following note content. Return ONLY a JSON array of lowercase tag strings.' },
      { role: 'user', content: content.slice(0, 2000) },
    ],
  });
  const tags = JSON.parse(response.choices[0]?.message?.content ?? '[]');
  return Response.json({ tags });
}
```

**Step 4.2**: Update `ai-tag-generator.tsx` to call `/api/ai/generate-tags` instead of mock

**Step 4.3**: Update `ai-title-generator.tsx` to call `/api/ai/generate-title` instead of mock

### 8.5 Phase 5: Cloud Functions & Polish (Days 10-12)

**Step 5.1**: Deploy Cloud Functions for:
- `onCreateUser` — set custom auth claims
- `onUpdateUser` — update auth claims on role/status change
- `onDeleteUser` — cleanup space assignments and soft-delete notes
- `onCreateNote` — update space `notesCount`, update tag `usageCount`
- `onDeleteNote` — update space `notesCount`, update tag `usageCount`
- `onUpdateNoteTags` — recompute tag usage counts when tags change

**Step 5.2**: Add Firestore composite indexes (create `firestore.indexes.json`):

```json
{
  "indexes": [
    {
      "collectionGroup": "notes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "createdBy", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "notes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "spaceId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "notes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "createdBy", "order": "ASCENDING" },
        { "fieldPath": "isPinned", "order": "DESCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "notes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "createdBy", "order": "ASCENDING" },
        { "fieldPath": "manualTags", "arrayConfig": "CONTAINS" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

**Step 5.3**: Remove demo quick-login buttons (or gate behind `NODE_ENV === 'development'`)

**Step 5.4**: Add loading states and error boundaries for all Firebase operations

**Step 5.5**: Add offline persistence for Firestore

```typescript
import { enableIndexedDbPersistence } from 'firebase/firestore';

if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open — persistence only works in one tab
    }
  });
}
```

---

## 9. Mock Removal Plan

### 9.1 Removal Order

The mock layer should be removed in a specific order to avoid breaking dependencies:

| Step | Action | Files Affected |
|---|---|---|
| 1 | Create `src/lib/firebase.ts` and `src/lib/firebase-admin.ts` | New files |
| 2 | Rewrite `src/services/auth.service.ts` | `auth.service.ts` |
| 3 | Rewrite `src/services/notes.service.ts` | `notes.service.ts` |
| 4 | Rewrite `src/services/spaces.service.ts` | `spaces.service.ts` |
| 5 | Rewrite `src/services/tags.service.ts` | `tags.service.ts` |
| 6 | Rewrite `src/services/ai.service.ts` | `ai.service.ts` + API routes |
| 7 | Update `src/store/auth-store.ts` for Firebase auth state | `auth-store.ts` |
| 8 | Update `src/store/notes-store.ts` for timestamp mapping | `notes-store.ts` |
| 9 | Update `src/features/profile/components/profile-page.tsx` for Storage uploads | `profile-page.tsx` |
| 10 | Update `src/features/notes/components/type-editors.tsx` for Storage uploads | `type-editors.tsx` |
| 11 | Update `src/features/notes/components/note-viewer.tsx` for Storage URLs | `note-viewer.tsx` |
| 12 | Update `src/features/auth/components/auth-page.tsx` remove demo buttons | `auth-page.tsx` |
| 13 | Delete `src/mock/` directory entirely | All mock files |
| 14 | Remove `src/lib/db.ts` (Prisma) | `db.ts` |
| 15 | Remove `prisma/` directory and Prisma dependencies | `package.json` |
| 16 | Update `.env` — remove `DATABASE_URL`, add Firebase vars | `.env` |

### 9.2 Replacement Mapping

| Mock Source | Firebase Replacement | Notes |
|---|---|---|
| `mock/data/users.mock.ts` | `users/{uid}` Firestore collection | UID becomes Firebase Auth UID |
| `mock/data/notes.mock.ts` | `notes/{noteId}` Firestore collection | ID changes from `note-001` to Firestore doc ID |
| `mock/data/spaces.mock.ts` | `spaces/{spaceId}` Firestore collection | Same structure |
| `mock/data/tags.mock.ts` | `tags/{tagId}` Firestore collection | Derived from notes, maintained by Cloud Functions |
| `mock/data/files.mock.ts` | Firebase Storage `attachments/{noteId}/*` | Move binary data out of Firestore |
| `mock/data/space-assignments.mock.ts` | `spaceAssignments/{id}` Firestore collection | Same structure |
| `mock/data/app-settings.mock.ts` | `settings/appConfig` Firestore singleton | Same structure |
| `mock/services/auth.service.mock.ts` | Firebase Auth + Firestore reads/writes | Complete rewrite |
| `mock/services/notes.service.mock.ts` | Firestore CRUD on `notes/` collection | Complete rewrite |
| `mock/services/spaces.service.mock.ts` | Firestore CRUD on `spaces/` collection | Complete rewrite |
| `mock/services/tags.service.mock.ts` | Firestore query on `tags/` collection | Complete rewrite |
| `mock/services/ai.service.mock.ts` | `z-ai-web-dev-sdk` via API routes | Complete rewrite |

### 9.3 Type Compatibility Changes

The existing TypeScript types in `src/types/index.ts` require minimal changes:

| Type | Change Required |
|---|---|
| `User.id` | Currently `string` — keep as string, use Firebase Auth UID |
| `Note.id` | Currently `string` — keep as string, use Firestore document ID |
| `Note.createdAt` | Currently `Date` — need `toDate()` conversion from Firestore `Timestamp` |
| `Space.id` | Currently `string` — keep as string, use Firestore document ID |
| `Tag.id` | Currently `string` — change from UUID to slugified tag name |
| All `Date` fields | Add timestamp mapping utility function |

---

## 10. Backend Implementation Checklist

### Phase 1: Foundation (Days 1-2)

- [ ] Create Firebase project in Firebase Console
- [ ] Enable Email/Password authentication provider
- [ ] Enable Google authentication provider
- [ ] Create Firestore database (production mode, location: us-central1)
- [ ] Create Storage bucket
- [ ] Download service account key JSON
- [ ] Install `firebase` npm package (`bun add firebase`)
- [ ] Remove `prisma` and `@prisma/client` packages (`bun remove prisma @prisma/client`)
- [ ] Create `src/lib/firebase.ts` (client-side SDK initialization)
- [ ] Create `src/lib/firebase-admin.ts` (server-side admin SDK initialization)
- [ ] Create `.env.local` with all Firebase config variables
- [ ] Create `src/app/api/health/route.ts` to verify Firebase connectivity
- [ ] Verify emulators work locally (`bunx firebase emulators:start`)

### Phase 2: Authentication (Days 3-4)

- [ ] Rewrite `src/services/auth.service.ts` with Firebase Auth
- [ ] Implement `login()` — `signInWithEmailAndPassword`
- [ ] Implement `signup()` — `createUserWithEmailAndPassword` + Firestore user doc creation
- [ ] Implement `logout()` — `signOut(auth)`
- [ ] Implement `getCurrentUser()` — Firestore read of `users/{uid}`
- [ ] Implement `getAllUsers()` — Firestore collection query
- [ ] Implement `updateUserRole()` — Firestore doc update + custom claims
- [ ] Implement `suspendUser()` / `activateUser()` — Firestore doc update + custom claims
- [ ] Implement `deleteUser()` — `deleteUser(auth)` + Firestore doc delete + cleanup
- [ ] Update `src/store/auth-store.ts` to use `onAuthStateChanged` for session persistence
- [ ] Add auth state listener in `app/page.tsx` or `app/layout.tsx`
- [ ] Update `src/features/auth/components/auth-page.tsx` — remove demo quick-login (or gate behind dev mode)
- [ ] Handle `publicSignupEnabled` setting check in signup flow
- [ ] Add proper error handling and toast notifications for auth failures
- [ ] Implement `sendPasswordResetEmail` for password reset

### Phase 3: Notes + Spaces + Tags (Days 5-7)

- [ ] Rewrite `src/services/notes.service.ts` with Firestore CRUD
- [ ] Implement `getNotes()` — query by `createdBy`, ordered by `createdAt` desc
- [ ] Implement `getNoteById()` — single doc read
- [ ] Implement `createNote()` — add doc with `serverTimestamp()`
- [ ] Implement `updateNote()` — doc update with `serverTimestamp()` on `updatedAt`
- [ ] Implement `deleteNote()` — doc delete
- [ ] Implement `togglePin()` — doc update
- [ ] Implement `toggleVisibility()` — doc update
- [ ] Implement `getOverviewStats()` — aggregate queries
- [ ] Implement `searchNotes()` — use Firestore `where` + `orderBy` or Algolia if needed
- [ ] Rewrite `src/services/spaces.service.ts` with Firestore CRUD
- [ ] Rewrite `src/services/tags.service.ts` with Firestore queries
- [ ] Update `src/store/notes-store.ts` — add timestamp mapping, handle loading states
- [ ] Update `src/store/spaces-store.ts` — add timestamp mapping
- [ ] Update `src/store/tags-store.ts` — add timestamp mapping
- [ ] Create all required Firestore composite indexes
- [ ] Implement client-side search with `useDebounce` hook (or add Algolia integration)

### Phase 4: File Uploads (Days 8-9)

- [ ] Rewrite image upload in `type-editors.tsx` to use Firebase Storage
- [ ] Rewrite document upload in `type-editors.tsx` to use Firebase Storage
- [ ] Update `note-viewer.tsx` to render `attachmentUrl` from Storage
- [ ] Rewrite avatar upload in `profile-page.tsx` to use Firebase Storage
- [ ] Implement image/document preview from Storage URLs
- [ ] Add upload progress indicators
- [ ] Handle upload errors gracefully
- [ ] Add file type validation on upload

### Phase 5: AI Features (Days 10-11)

- [ ] Create `src/app/api/ai/generate-tags/route.ts` — API route using `z-ai-web-dev-sdk`
- [ ] Create `src/app/api/ai/generate-title/route.ts` — API route using `z-ai-web-dev-sdk`
- [ ] Rewrite `src/services/ai.service.ts` to call API routes instead of mock
- [ ] Update `ai-tag-generator.tsx` for real API integration
- [ ] Update `ai-title-generator.tsx` for real API integration
- [ ] Add loading states and error handling for AI responses
- [ ] Add rate limiting for AI endpoints (protect quota)

### Phase 6: Security & Polish (Days 12-14)

- [ ] Write and deploy Firestore security rules
- [ ] Write and deploy Firebase Storage security rules
- [ ] Set up custom auth claims via Cloud Functions
- [ ] Deploy Cloud Functions for:
  - [ ] `onCreateUser` — set default role claims
  - [ ] `onUpdateUser` — update claims on role/status change
  - [ ] `onDeleteUser` — cleanup assignments and notes
  - [ ] `onCreateNote` / `onDeleteNote` — update denormalized counts
- [ ] Add Firebase App Check for request verification
- [ ] Enable Firestore offline persistence
- [ ] Add proper loading skeletons for all data-fetching operations
- [ ] Add error boundaries and retry logic for failed operations
- [ ] Test complete user flows:
  - [ ] Signup → create note → pin note → search → logout
  - [ ] Login → edit note → toggle visibility → add tag → delete note
  - [ ] Admin: create space → assign user → change role → suspend user
  - [ ] Image upload → view in note → delete note
  - [ ] Quick note → voice input → code block → save

### Phase 7: Cleanup (Day 15)

- [ ] Delete `src/mock/` directory entirely
- [ ] Remove `src/lib/db.ts` (Prisma singleton)
- [ ] Remove `prisma/` directory
- [ ] Remove unused `next-auth` dependency
- [ ] Remove unused `@mdxeditor/editor` dependency (if not using it)
- [ ] Remove unused `react-syntax-highlighter` dependency (replaced by custom highlighter)
- [ ] Clean up `.env` — remove `DATABASE_URL`, add only Firebase vars
- [ ] Update `package.json` — remove Prisma scripts, add Firebase deploy scripts
- [ ] Final build verification (`bun run build`)
- [ ] Final end-to-end testing

---

## Appendix A: File Change Summary

| File | Action | Description |
|---|---|---|
| `src/lib/firebase.ts` | CREATE | Client-side Firebase SDK init |
| `src/lib/firebase-admin.ts` | CREATE | Server-side Firebase Admin SDK init |
| `src/app/api/ai/generate-tags/route.ts` | CREATE | AI tag generation endpoint |
| `src/app/api/ai/generate-title/route.ts` | CREATE | AI title generation endpoint |
| `src/services/auth.service.ts` | REWRITE | Firebase Auth + Firestore users |
| `src/services/notes.service.ts` | REWRITE | Firestore notes CRUD |
| `src/services/spaces.service.ts` | REWRITE | Firestore spaces CRUD |
| `src/services/tags.service.ts` | REWRITE | Firestore tags query |
| `src/services/ai.service.ts` | REWRITE | API route calls for AI |
| `src/store/auth-store.ts` | UPDATE | Auth state listener, timestamp mapping |
| `src/store/notes-store.ts` | UPDATE | Timestamp mapping |
| `src/store/spaces-store.ts` | UPDATE | Timestamp mapping |
| `src/store/tags-store.ts` | UPDATE | Timestamp mapping |
| `src/features/auth/components/auth-page.tsx` | UPDATE | Remove demo buttons, add Google OAuth |
| `src/features/profile/components/profile-page.tsx` | UPDATE | Firebase Storage avatar upload |
| `src/features/notes/components/type-editors.tsx` | UPDATE | Firebase Storage file uploads |
| `src/features/notes/components/note-viewer.tsx` | UPDATE | Render from Storage URLs |
| `src/features/notes/components/ai-tag-generator.tsx` | UPDATE | Real API integration |
| `src/features/notes/components/ai-title-generator.tsx` | UPDATE | Real API integration |
| `src/types/index.ts` | MINOR UPDATE | Add optional `uid` field, document ID type alias |
| `src/mock/` (entire directory) | DELETE | No longer needed |
| `src/lib/db.ts` | DELETE | Prisma singleton replaced by Firebase |
| `prisma/` (entire directory) | DELETE | Prisma replaced by Firestore |
| `package.json` | UPDATE | Add firebase, remove prisma |
| `.env` | UPDATE | Add Firebase config, remove DATABASE_URL |

## Appendix B: Estimated Timeline

| Phase | Duration | Dependencies |
|---|---|---|
| Phase 1: Foundation | 2 days | Firebase project setup |
| Phase 2: Authentication | 2 days | Phase 1 |
| Phase 3: Notes + Spaces + Tags | 3 days | Phase 2 |
| Phase 4: File Uploads | 2 days | Phase 3 |
| Phase 5: AI Features | 2 days | Phase 3 |
| Phase 6: Security & Polish | 3 days | Phases 1-5 |
| Phase 7: Cleanup | 1 day | All phases |
| **Total** | **~15 days** | |

## Appendix C: Cost Estimation (Firebase Blaze Plan)

| Service | Free Tier | Expected Usage | Monthly Cost |
|---|---|---|---|
| Auth (Email) | 50k/month | ~1k users | $0 |
| Firestore reads | 50k/day | ~50k/day | $0 |
| Firestore writes | 20k/day | ~5k/day | $0 |
| Firestore storage | 1 GiB | ~500 MiB | $0 |
| Storage (avatars) | 5 GiB | ~1 GiB | $0.02/GB = $0.02 |
| Storage (attachments) | 5 GiB | ~2 GiB | $0.02/GB = $0.04 |
| Cloud Functions | 2M invocations | ~100k invocations | $0 |
| Hosting | — | Static + SSR | $0 |
| **Total** | — | Small-medium app | **<$1/month** |

Firebase's free tier is extremely generous for this use case. A NeuroNote instance with 1,000 active users would likely remain within the free tier for all services except Storage.
