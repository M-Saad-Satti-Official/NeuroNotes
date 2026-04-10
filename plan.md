# NeuroNote - Backend Architecture Plan

> **Version**: 1.0
> **Date**: 2026-04-10
> **Scope**: Technology-agnostic backend requirements, data models, API design, storage strategy, and architecture options. This document does NOT prescribe a specific backend technology.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Feature Breakdown](#2-feature-breakdown)
3. [Mock Data Analysis](#3-mock-data-analysis)
4. [Backend Requirements](#4-backend-requirements)
5. [Data Models (Abstract)](#5-data-models-abstract)
6. [API Design (Technology-Agnostic)](#6-api-design-technology-agnostic)
7. [Storage Strategy](#7-storage-strategy)
8. [Authentication Strategy](#8-authentication-strategy)
9. [Architecture Options](#9-architecture-options)
10. [Migration Plan](#10-migration-plan)
11. [Implementation Checklist](#11-implementation-checklist)

---

## 1. Project Overview

### 1.1 What Is NeuroNote?

NeuroNote is an AI-powered personal knowledge management system (PKM) built as a single-page application using Next.js 16. It allows users to create, organize, search, and manage knowledge notes across multiple workspaces called "Spaces." The app supports six note types (text, image, video, link, document, quick note), features AI-powered tag and title generation, an IDE-style code block editor with syntax highlighting for 23+ languages, voice-to-text input via the Web Speech API, and a role-based access control system with granular permission overrides.

The frontend is fully functional and operates with an in-memory mock data layer. The architecture is designed with a clean service abstraction that allows the backend to be swapped by modifying only five bridge files.

### 1.2 Current Architecture

```
React Components
        |
Zustand Stores (5 stores: notes, spaces, tags, auth, ui)
        |
Service Bridge Layer (5 files in src/services/)
        |  100% delegation
Mock Services (5 files in src/mock/services/)
        |
Mock Data (7 files in src/mock/data/)
```

**Key design principle**: Every service file in `src/services/` is a thin proxy that imports from `src/mock/services/`. Connecting a real backend requires modifying only these 5 bridge files. No component or store code needs to change.

### 1.3 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1 (App Router) |
| Language | TypeScript 5 |
| UI | Tailwind CSS 4 + shadcn/ui (59 components) |
| State | Zustand 5 |
| Animation | Framer Motion 12 |
| Charts | Recharts |
| Forms | React Hook Form + Zod 4 |
| AI SDK | z-ai-web-dev-sdk (installed, ready) |
| Runtime | Bun |

---

## 2. Feature Breakdown

### 2.1 Notes

| Feature | What It Does | Data Needed | Backend Required |
|---|---|---|---|
| Create note (6 types) | Create text, image, video, link, document, or quick notes | Note title, content, type, tags, space, visibility | CRUD API for notes + file upload for image/document |
| Edit note | Update title, content, tags, space, visibility | Note ID, updated fields | Update API endpoint |
| Delete note | Remove a note with confirmation | Note ID | Delete API endpoint |
| Pin/unpin | Mark notes as important | Note ID, boolean | Toggle API endpoint |
| Visibility toggle | Switch between public and private | Note ID, visibility value | Toggle API endpoint |
| Full-text search | Search across title, content, and tags | Query string | Search/filter API with text matching |
| Sort | Order by latest, oldest, or alphabetical | Sort parameter | Client-side (data fetched, then sorted) or server-side ordering |
| Filter by tag | Show notes with a specific tag | Tag name | Filter API or client-side filtering |
| Filter by space | Show notes in a specific space | Space ID | Filter API or client-side filtering |
| Grid/list view | Toggle display layout | View preference | Client-side only (no backend) |

### 2.2 Spaces (Workspaces)

| Feature | What It Does | Data Needed | Backend Required |
|---|---|---|---|
| Create space | Create a new workspace with name, color, icon | Space name, color, icon, description | CRUD API for spaces |
| Edit space | Update space name, color, description | Space ID, updated fields | Update API endpoint |
| Delete space | Remove a space | Space ID | Delete API endpoint |
| Toggle visibility | Switch space between public and private | Space ID | Toggle API endpoint |
| Space filtering | Filter notes by space | Space ID | Query parameter on notes API |

### 2.3 Tags

| Feature | What It Does | Data Needed | Backend Required |
|---|---|---|---|
| Tag list | Show all tags with usage counts | Tag name, count | Tags can be derived from notes or stored independently |
| Tag autocomplete | Suggest tags while typing | Partial tag name | Search API on tags |
| Tag filtering | Filter notes by tag | Tag name | Query parameter on notes API |

**Design note**: Currently, tags are derived dynamically from note data (both `manualTags` and `aiTags` arrays). A real backend can either (a) continue deriving tags from notes at query time, or (b) maintain a separate tags collection/table for faster lookups.

### 2.4 Authentication & Users

| Feature | What It Does | Data Needed | Backend Required |
|---|---|---|---|
| Login | Authenticate with email/password | Email, password | Auth API (login endpoint) |
| Signup | Create a new account | Name, email, password | Auth API (signup endpoint) |
| Logout | End session | Session/token | Auth API (logout endpoint) |
| Session persistence | Stay logged in across page refreshes | Session token or cookie | Persistent session mechanism |
| User roles | 3 roles: admin, editor, viewer | Role field on user record | User data storage |
| Permission checks | 14 granular permission keys per role | Role + permission overrides | Computed on client from user role + settings |
| User management | Admin can manage other users | User list, role assignment | Admin API endpoints |
| User suspension | Temporarily disable accounts | User status field | Update user status API |

### 2.5 AI Features

| Feature | What It Does | Data Needed | Backend Required |
|---|---|---|---|
| AI tag generation | Suggest tags based on note content | Note content text | AI API call (LLM for text classification) |
| AI title generation | Suggest a title based on note content | Note content text | AI API call (LLM for text generation) |

**Current mock behavior**: Tag generation uses keyword scoring with 25+ category mappings. Title generation extracts the first sentence. The real implementation should use the already-installed `z-ai-web-dev-sdk` for LLM-powered generation.

### 2.6 Code Block Editor

| Feature | What It Does | Data Needed | Backend Required |
|---|---|---|---|
| Syntax highlighting | Colorize code tokens in 23+ languages | Code string + language identifier | Client-side only (custom highlighter in `syntax-highlight.ts`) |
| Code block insertion | Insert code blocks into note content | Code string, language | No backend (stored as part of note content) |
| Inline editing | Edit code blocks directly in preview | Code string | No backend (part of note content) |

### 2.7 Voice Input

| Feature | What It Does | Data Needed | Backend Required |
|---|---|---|---|
| Speech-to-text | Convert voice to text using browser API | Microphone access | No backend (browser Web Speech API) |

### 2.8 Admin Panel

| Feature | What It Does | Data Needed | Backend Required |
|---|---|---|---|
| User management | List, search, filter users | User records | List/search users API |
| Role assignment | Change user roles | User ID, new role | Update user role API |
| User suspension/activation | Disable/enable accounts | User ID, status | Update user status API |
| User deletion | Remove user accounts | User ID | Delete user API |
| Space access management | Assign/remove users from spaces | User ID, Space ID, role | Space assignment API |
| Space deletion from admin | Delete spaces | Space ID | Delete space API |

### 2.9 Settings

| Feature | What It Does | Data Needed | Backend Required |
|---|---|---|---|
| App settings | Configure signup toggle, default role, max notes | Settings object | Settings CRUD API |
| Permission matrix | Customize per-role permissions | Role + permission overrides | Permission overrides API |
| Space management | CRUD operations on spaces | Space records | Space CRUD API |

### 2.10 Profile

| Feature | What It Does | Data Needed | Backend Required |
|---|---|---|---|
| View profile | Display user info | User record | Read user API |
| Edit name/email | Update display info | User ID, name, email | Update user API |
| Avatar upload | Upload profile picture | Image file | File upload API + storage |
| Password change | Update password | Current + new password | Password change API |

### 2.11 Analytics (Overview)

| Feature | What It Does | Data Needed | Backend Required |
|---|---|---|---|
| Note statistics | Total notes, by type, by space | Aggregated note data | Can be computed client-side from fetched notes, or via dedicated stats API |
| Activity chart | Notes created per day (7 days) | Note creation timestamps | Can be computed client-side, or via dedicated stats API |
| Pinned notes count | Number of pinned notes | Note records | Derived from notes data |
| Tag count | Total unique tags | Tags from notes | Derived from notes data |

**Design note**: The current implementation computes all analytics client-side from fetched note data. This works well for single-user applications with moderate data volumes. For larger datasets, a dedicated stats endpoint would be more efficient.

---

## 3. Mock Data Analysis

### 3.1 Mock Data Files

| File | Content | Records | Backend Replacement |
|---|---|---|---|
| `notes.mock.ts` | 12 pre-populated notes with rich content | 12 | Notes table/collection in database |
| `spaces.mock.ts` | 4 workspaces (Personal, Work, Ideas, Learning) | 4 | Spaces table/collection in database |
| `users.mock.ts` | 6 users (1 admin, 2 editors, 3 viewers, 1 suspended) | 6 | Users table/collection (auth system) |
| `tags.mock.ts` | Derived dynamically from notes | Dynamic | Derived from notes or separate tags table |
| `files.mock.ts` | 6 mock file entries (PNG, TS, PDF, CSV, MD) | 6 | File storage service (S3, GCS, etc.) |
| `space-assignments.mock.ts` | 5 user-to-space assignments | 5 | Space assignments table/collection |
| `app-settings.mock.ts` | 1 default settings object | 1 | Settings table/collection (singleton) |

### 3.2 Mock Service Files

| File | Functions | Simulated Delay |
|---|---|---|
| `notes.service.mock.ts` | 9 functions (CRUD + search + stats) | 200-300ms |
| `auth.service.mock.ts` | 17 functions (auth + users + settings + assignments) | 150-600ms |
| `spaces.service.mock.ts` | 6 functions (CRUD + visibility toggle) | 150-300ms |
| `tags.service.mock.ts` | 3 functions (get/create/delete) | 100ms |
| `ai.service.mock.ts` | 2 functions (generateTags, generateTitle) | 400-500ms |

### 3.3 Service Bridge Layer

All five service files in `src/services/` follow an identical pattern:

```typescript
import * as mockService from '@/mock/services/xxx.service.mock';

export const xxxService = {
  methodA: mockService.methodA,
  methodB: mockService.mockB,
};
```

**This is the exact swap point.** Only these five files need to be rewritten when connecting a real backend. Components and stores remain untouched.

### 3.4 Data Currently Stored as Base64

The image and document note types currently store binary data directly in the note `content` field:

| Note Type | Current Storage | Size Concern |
|---|---|---|
| `image` | Base64 data URI or URL string | Up to 10MB - must move to file storage |
| `document` | JSON with base64 `data` field | Up to 50MB - must move to file storage |
| `video` | YouTube/Vimeo URL string | Small - fine in database |
| `link` | URL + description text | Small - fine in database |
| `text` / `quick` | Plain text + markdown | Variable - fine in database |

**Backend requirement**: Image and document binary data MUST be stored in a file/object storage service (S3, GCS, Azure Blob, etc.). The database should only store the file URL/path reference.

---

## 4. Backend Requirements

### 4.1 Core Capabilities

#### CRUD Operations
The backend must support full create, read, update, and delete operations for: notes, spaces, tags, users, and app settings. Each CRUD operation should return appropriate HTTP status codes and structured error responses.

#### Search and Filtering
- **Full-text search** across note titles and content
- **Tag-based filtering** (match notes containing specific tags)
- **Space-based filtering** (match notes in a specific space)
- **Combined filters** (tag + space + search query simultaneously)
- **User search** for admin panel (by name, email, role)

#### File Upload Handling
- Accept image files (PNG, JPG, GIF, WebP) up to 10MB
- Accept document files (PDF, DOCX, TXT, CSV) up to 50MB
- Generate unique file paths to avoid collisions
- Return a URL/path for the uploaded file to store in the database
- Support avatar uploads (images only, up to 5MB)

#### Data Validation
- Validate email format on signup/login
- Enforce unique space names (case-insensitive)
- Validate note types against allowed values
- Enforce maximum note counts per user (configurable)
- Validate file types and sizes
- Validate role values against allowed roles

#### Error Handling
- Structured error responses with machine-readable error codes
- Human-readable error messages
- Consistent HTTP status codes (200, 201, 400, 401, 403, 404, 409, 422, 500)
- Request ID for debugging/correlation

#### Scalability Considerations
- **Small scale** (single user): Any database works - even SQLite
- **Medium scale** (small team): PostgreSQL, MySQL, or MongoDB with proper indexing
- **Large scale** (many users): Need pagination, query optimization, possible read replicas
- **File storage**: Object storage (S3-compatible) for any scale
- **Search**: Built-in database full-text search for small/medium; dedicated search engine (Algolia, Meilisearch, Elasticsearch) for large scale

### 4.2 Required Backend Modules

#### Module 1: Authentication
- User registration (email + password)
- User login (email + password)
- Session management (token or cookie-based)
- Password hashing (bcrypt or argon2)
- Optional: OAuth providers (Google, GitHub)
- Optional: Password reset via email

#### Module 2: Notes Management
- Create, read, update, delete notes
- Pin/unpin toggle
- Visibility toggle (public/private)
- Full-text search across notes
- Sort by date, alphabetical
- Filter by tags, spaces, pinned status

#### Module 3: Spaces Management
- Create, read, update, delete spaces
- Visibility toggle
- Unique name enforcement

#### Module 4: Tags System
- List all tags with usage counts
- Tags can be derived from notes or stored independently
- Tag search/autocomplete

#### Module 5: User Management (Admin)
- List all users with pagination
- Search users by name/email
- Update user role
- Suspend/activate users
- Delete users
- Space assignment management

#### Module 6: App Settings
- Read/write global app settings (singleton)
- Read/write permission overrides per role

#### Module 7: File Storage
- Upload files (avatars, note attachments)
- Read files (serve or generate signed URLs)
- Delete files (when notes are deleted)
- File type and size validation

#### Module 8: AI Integration
- Generate tags from note content (via LLM)
- Generate title from note content (via LLM)
- Can be implemented as server-side API calls to any LLM provider

---

## 5. Data Models (Abstract)

### 5.1 User

```
User
  id            : string (unique identifier)
  name          : string (display name)
  email         : string (unique, lowercase)
  password_hash : string (hashed password)
  role          : enum [admin, editor, viewer]
  status        : enum [active, suspended]
  avatar_url    : string (nullable - file storage URL)
  created_at    : timestamp
  updated_at    : timestamp
  last_login    : timestamp (nullable)
```

### 5.2 Note

```
Note
  id            : string (unique identifier)
  title         : string
  content       : string (text/markdown for text/link/video/quick;
                          caption for image/document)
  note_type     : enum [text, image, video, link, document, quick]
  manual_tags   : string[] (user-added tags, lowercase)
  ai_tags       : string[] (AI-generated tags, lowercase)
  space_id      : string (nullable - reference to Space)
  visibility    : enum [public, private]
  created_by    : string (reference to User)
  is_pinned     : boolean
  attachment_url: string (nullable - file storage URL for image/document)
  attachment_type: string (nullable - MIME type)
  attachment_size: number (nullable - bytes)
  created_at    : timestamp
  updated_at    : timestamp
```

### 5.3 Space

```
Space
  id            : string (unique identifier)
  name          : string (unique, case-insensitive)
  description   : string (nullable)
  icon          : string (Lucide icon name)
  color         : string (hex color code)
  visibility    : enum [public, private]
  created_by    : string (reference to User)
  created_at    : timestamp
  updated_at    : timestamp
```

### 5.4 Tag

```
Tag
  id            : string (unique identifier)
  name          : string (unique, lowercase)
  usage_count   : number
  created_at    : timestamp
```

**Note**: Tags can either be stored as independent records or derived dynamically from note `manual_tags` and `ai_tags` arrays. The independent approach provides faster lookups and autocomplete. The derived approach ensures consistency without sync issues.

### 5.5 SpaceAssignment

```
SpaceAssignment
  id            : string (unique identifier)
  user_id       : string (reference to User)
  space_id      : string (reference to Space)
  role          : enum [editor, viewer]
  assigned_by   : string (reference to User who assigned)
  assigned_at   : timestamp
```

### 5.6 AppSettings (Singleton)

```
AppSettings
  id                      : string (fixed: "appConfig")
  public_signup_enabled   : boolean
  default_user_role       : enum [viewer, editor]
  max_notes_per_user      : number
  updated_at              : timestamp
  updated_by              : string (reference to User)
```

### 5.7 PermissionOverrides (Singleton)

```
PermissionOverrides
  id              : string (fixed: "appConfig")
  admin           : map<string, boolean> (empty = use defaults)
  editor          : map<string, boolean> (override specific keys)
  viewer          : map<string, boolean> (override specific keys)
  updated_at      : timestamp
  updated_by      : string (reference to User)
```

### 5.8 NoteFile (Attachment Metadata)

```
NoteFile
  id            : string (unique identifier)
  note_id       : string (reference to Note)
  file_name     : string
  file_url      : string (storage URL)
  file_type     : string (MIME type)
  file_size     : number (bytes)
  created_at    : timestamp
```

### 5.9 Entity Relationships

```
User (1) ──────< (N) Note
User (1) ──────< (N) Space
Space (1) ─────< (N) Note
Space (N) >────< (N) User  (via SpaceAssignment)
User (1) ──────< (N) Tag  (derived or direct)
Note (1) ──────< (N) NoteFile (optional)
AppSettings (1)  (singleton)
PermissionOverrides (1) (singleton)
```

---

## 6. API Design (Technology-Agnostic)

### 6.1 Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/login` | Login with email + password | No |
| POST | `/auth/signup` | Create new account | No |
| POST | `/auth/logout` | End session | Yes |
| GET | `/auth/me` | Get current user | Yes |
| POST | `/auth/password-reset` | Request password reset email | No |
| PUT | `/auth/password` | Change password | Yes |

### 6.2 Notes

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/notes` | List all notes (supports `?space=`, `?tag=`, `?search=`, `?sort=`, `?pinned=`) | Yes |
| GET | `/notes/:id` | Get a single note | Yes |
| POST | `/notes` | Create a new note | Yes |
| PUT | `/notes/:id` | Update a note | Yes |
| DELETE | `/notes/:id` | Delete a note | Yes |
| PATCH | `/notes/:id/pin` | Toggle pin status | Yes |
| PATCH | `/notes/:id/visibility` | Toggle visibility | Yes |

**Query parameters for `GET /notes`:**

| Parameter | Type | Description |
|---|---|---|
| `space` | string | Filter by space ID |
| `tag` | string | Filter by tag name |
| `search` | string | Full-text search query |
| `sort` | string | Sort order: `latest`, `oldest`, `alphabetical` |
| `pinned` | boolean | Filter pinned notes only |
| `type` | string | Filter by note type |

### 6.3 Spaces

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/spaces` | List all spaces | Yes |
| GET | `/spaces/:id` | Get a single space | Yes |
| POST | `/spaces` | Create a new space | Yes |
| PUT | `/spaces/:id` | Update a space | Yes |
| DELETE | `/spaces/:id` | Delete a space | Yes (admin) |
| PATCH | `/spaces/:id/visibility` | Toggle visibility | Yes |

### 6.4 Tags

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/tags` | List all tags with counts (supports `?search=`) | Yes |
| POST | `/tags` | Create a tag | Yes |
| DELETE | `/tags/:id` | Delete a tag | Yes |

### 6.5 Users (Admin)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/users` | List all users (supports `?search=`, `?role=`) | Yes (admin) |
| GET | `/users/:id` | Get a single user | Yes (admin or self) |
| PUT | `/users/:id` | Update user profile | Yes (self) or admin |
| PATCH | `/users/:id/role` | Change user role | Yes (admin) |
| PATCH | `/users/:id/status` | Suspend or activate user | Yes (admin) |
| DELETE | `/users/:id` | Delete a user | Yes (admin) |

### 6.6 Space Assignments

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/spaces/:id/members` | List members of a space | Yes (admin) |
| POST | `/spaces/:id/members` | Assign user to space | Yes (admin) |
| PUT | `/spaces/:id/members/:userId` | Change member role | Yes (admin) |
| DELETE | `/spaces/:id/members/:userId` | Remove user from space | Yes (admin) |

### 6.7 App Settings

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/settings` | Get app settings | Yes (admin) |
| PUT | `/settings` | Update app settings | Yes (admin) |
| GET | `/settings/permissions` | Get permission overrides | Yes (admin) |
| PUT | `/settings/permissions` | Update permission overrides | Yes (admin) |

### 6.8 Files

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/files/upload` | Upload a file (multipart/form-data) | Yes |
| GET | `/files/:id` | Get file metadata or redirect to file | Yes |
| DELETE | `/files/:id` | Delete a file | Yes (owner or admin) |

### 6.9 AI

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/ai/generate-tags` | Generate tags from content | Yes |
| POST | `/ai/generate-title` | Generate title from content | Yes |

### 6.10 Overview / Analytics

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/overview/stats` | Get aggregated statistics | Yes |

### 6.11 Response Format

**Success response:**

```json
{
  "data": { ... },
  "message": "Success"
}
```

**Error response:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description of the error",
    "details": { ... }
  },
  "request_id": "req_abc123"
}
```

**List response (with pagination):**

```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

---

## 7. Storage Strategy

### 7.1 Small Data (Database)

The following data is text-based and suitable for any database:

| Data | Approximate Size | Storage Location |
|---|---|---|
| User records | ~500 bytes each | Database |
| Note metadata (title, tags, type) | ~1 KB each | Database |
| Note content (text, links, video URLs) | ~5 KB each (avg) | Database |
| Space records | ~500 bytes each | Database |
| Tags | ~100 bytes each | Database |
| App settings | ~1 KB (singleton) | Database |
| Permission overrides | ~2 KB (singleton) | Database |

**Estimated total for a typical user with 1,000 notes**: ~10 MB in the database.

### 7.2 Large Data (File/Object Storage)

The following data is binary and MUST be stored in object/file storage:

| Data | Size Range | Storage Location |
|---|---|---|
| Note image attachments | Up to 10 MB each | Object storage (S3, GCS, etc.) |
| Note document attachments | Up to 50 MB each | Object storage |
| User avatar images | Up to 5 MB each | Object storage |
| Note video embeds | URL only (YouTube/Vimeo) | Database (URL string) |

**Storage path structure:**

```
avatars/{user_id}/{filename}
attachments/{note_id}/{filename}
```

### 7.3 Storage Requirements Summary

| Requirement | Details |
|---|---|
| Database | Any relational or document database that supports CRUD, indexing, and basic queries |
| Object storage | Any S3-compatible object storage service for file uploads |
| Capacity (small scale) | ~50 MB database + ~500 MB file storage per user |
| Capacity (medium scale) | ~500 MB database + ~5 GB file storage for 10 users |
| Backup | Regular database backups + object storage versioning |

---

## 8. Authentication Strategy

### 8.1 Options

#### Option A: Token-Based (JWT)

**How it works**: Server generates a signed JWT token on login. Client sends the token in the `Authorization` header with every request. Server validates the token on each request.

| Aspect | Details |
|---|---|
| Pros | Stateless, scalable, works across services |
| Cons | Token revocation is harder, larger payload |
| Best for | Distributed systems, microservices |
| Session persistence | Token stored in localStorage or httpOnly cookie |
| Implementation | `jsonwebtoken` library (Node.js), or any JWT library |

#### Option B: Session-Based (Cookie)

**How it works**: Server creates a session record in the database/memory store on login. Client receives a session cookie. Server looks up the session on each request.

| Aspect | Details |
|---|---|
| Pros | Easy revocation, smaller payload, more secure |
| Cons | Requires session store, harder to scale horizontally |
| Best for | Single-server, monolithic applications |
| Session persistence | Cookie with `httpOnly`, `secure`, `sameSite` flags |
| Implementation | Express sessions, database-backed sessions |

#### Option C: Third-Party Auth Provider

**How it works**: Delegate authentication to a specialized service (Auth0, Clerk, Supabase Auth, Firebase Auth, NextAuth).

| Aspect | Details |
|---|---|
| Pros | Production-ready, handles edge cases, supports OAuth |
| Cons | Vendor lock-in, cost at scale, less control |
| Best for | Rapid development, teams without auth expertise |
| Session persistence | Handled by the provider |
| Implementation | Provider SDK integration |

### 8.2 Password Security

Regardless of the authentication strategy:

- **Hash passwords** using bcrypt (cost factor 12) or argon2id
- **Never store plaintext passwords**
- **Validate password strength** on signup (minimum 8 characters)
- **Rate-limit login attempts** to prevent brute force
- **Use HTTPS** for all auth-related requests

### 8.3 Session Persistence

The app currently loses all state on page refresh. A real backend must persist sessions so users stay logged in. This is typically achieved through:

- Persistent cookies (for session-based auth)
- Long-lived JWT tokens with refresh tokens (for token-based auth)
- `onAuthStateChanged` listener pattern (for third-party auth)

---

## 9. Architecture Options

### Option 1: Custom REST API (Node.js/Express or Next.js API Routes)

**Description**: Build a custom REST API using Node.js with Express (standalone) or Next.js API routes (integrated). Connect to any database (PostgreSQL, MySQL, MongoDB, SQLite).

**Architecture:**

```
Next.js Frontend
    |
    v
Next.js API Routes (or separate Express server)
    |
    v
Database (PostgreSQL / SQLite / MongoDB)
    |
Object Storage (S3 / local disk)
```

**Pros:**
- Full control over every aspect
- No vendor lock-in
- Can use any database
- Lowest cost (no third-party service fees)
- Best for learning and customization
- Easy to host on any VPS or cloud provider

**Cons:**
- Must implement auth, validation, error handling from scratch
- Must manage server infrastructure
- More development time
- Must handle scaling manually

**When to choose:**
- You want full control and no vendor dependencies
- You are comfortable managing servers
- You want to keep costs minimal
- You want to learn backend development

**Recommended stack:** Next.js API Routes + Prisma ORM + PostgreSQL (or SQLite for single-user)

---

### Option 2: Backend-as-a-Service (BaaS)

**Description**: Use a managed backend service that provides auth, database, file storage, and serverless functions out of the box. Examples: Supabase, Firebase, Appwrite.

**Architecture:**

```
Next.js Frontend
    |
    v
BaaS SDK (client-side)
    |
    v
BaaS Platform (auth, database, storage, functions)
```

**Pros:**
- Fastest development time
- Auth, database, storage all included
- Built-in security rules
- Automatic scaling
- Usually has a generous free tier

**Cons:**
- Vendor lock-in
- Cost increases at scale
- Less control over infrastructure
- May have limitations on complex queries
- Migration difficulty if you outgrow it

**When to choose:**
- You want to ship quickly
- You don't want to manage servers
- You are comfortable with vendor dependency
- Your use case fits within the platform's capabilities

**Recommended options:**
- **Supabase**: Open-source Firebase alternative, PostgreSQL-based, excellent realtime
- **Firebase**: Most mature BaaS, great ecosystem, NoSQL (Firestore)
- **Appwrite**: Open-source, self-hostable, good for privacy-sensitive apps

---

### Option 3: Serverless Functions + Managed Database

**Description**: Use serverless functions (AWS Lambda, Vercel Functions, Cloudflare Workers) for API logic, connected to a managed database (PlanetScale, Neon, Supabase, MongoDB Atlas) and object storage (S3, Cloudflare R2).

**Architecture:**

```
Next.js Frontend
    |
    v
Serverless Functions (Vercel / AWS Lambda / Cloudflare Workers)
    |
    v
Managed Database (Neon / PlanetScale / MongoDB Atlas)
    |
Object Storage (Cloudflare R2 / AWS S3)
```

**Pros:**
- Pay-per-use pricing (cheap for low traffic)
- Automatic scaling
- No server management
- Can choose best-in-class services for each layer
- Geographically distributed (edge functions)

**Cons:**
- Cold start latency
- More complex architecture
- Multiple services to manage
- Vendor lock-in per service
- Debugging can be harder

**When to choose:**
- You want optimal performance and cost at scale
- You are comfortable with distributed architecture
- You need geographic distribution
- You want to pick best-of-breed services

**Recommended stack:** Vercel Functions + Neon (PostgreSQL) + Cloudflare R2

---

### Comparison Summary

| Aspect | Custom REST API | BaaS (Supabase/Firebase) | Serverless + Managed DB |
|---|---|---|---|
| Development time | 2-4 weeks | 3-7 days | 1-2 weeks |
| Control | Full | Limited | Moderate |
| Cost (small scale) | $5-20/mo | Free - $25/mo | Free - $20/mo |
| Cost (large scale) | $20-100/mo | $50-500/mo | $20-200/mo |
| Scaling | Manual | Automatic | Automatic |
| Vendor lock-in | None | High | Medium |
| Learning curve | Medium | Low | High |
| Best for | Full control, learning | Speed, simplicity | Scale, performance |

---

## 10. Migration Plan

### Step 1: Set Up Authentication
1. Choose auth strategy (see Section 8)
2. Implement login, signup, logout endpoints
3. Add session persistence
4. Update `auth.service.ts` bridge file
5. Test: user can log in, refresh page, still logged in

### Step 2: Connect Database
1. Choose database (see Section 9)
2. Define schema matching data models (Section 5)
3. Implement CRUD for notes
4. Update `notes.service.ts` bridge file
5. Test: create, edit, delete notes persist across refresh

### Step 3: Connect Remaining Services
1. Implement spaces CRUD, update `spaces.service.ts`
2. Implement tags, update `tags.service.ts`
3. Implement file upload, add attachment support
4. Implement app settings and permission overrides

### Step 4: Connect AI Features
1. Set up LLM API access (via `z-ai-web-dev-sdk` or direct API)
2. Implement AI tag generation endpoint
3. Implement AI title generation endpoint
4. Update `ai.service.ts` bridge file

### Step 5: Remove Mock Layer
1. Delete `src/mock/` directory
2. Remove mock imports from service bridge files
3. Clean up any unused mock data files
4. Test all features end-to-end

### Step 6: Add Admin Features
1. Implement user management endpoints
2. Implement space assignment endpoints
3. Test admin panel functionality

---

## 11. Implementation Checklist

### Infrastructure
- [ ] Choose and set up database
- [ ] Choose and set up file/object storage
- [ ] Configure authentication system
- [ ] Set up environment variables
- [ ] Configure CORS and security headers

### Authentication
- [ ] Login endpoint
- [ ] Signup endpoint
- [ ] Logout endpoint
- [ ] Session persistence (survives page refresh)
- [ ] Password hashing
- [ ] Rate limiting on login

### Notes API
- [ ] GET /notes (with search, filter, sort)
- [ ] GET /notes/:id
- [ ] POST /notes
- [ ] PUT /notes/:id
- [ ] DELETE /notes/:id
- [ ] PATCH /notes/:id/pin
- [ ] PATCH /notes/:id/visibility

### Spaces API
- [ ] GET /spaces
- [ ] POST /spaces
- [ ] PUT /spaces/:id
- [ ] DELETE /spaces/:id
- [ ] PATCH /spaces/:id/visibility

### Tags API
- [ ] GET /tags
- [ ] POST /tags
- [ ] DELETE /tags/:id

### Users API (Admin)
- [ ] GET /users
- [ ] PATCH /users/:id/role
- [ ] PATCH /users/:id/status
- [ ] DELETE /users/:id

### Settings API
- [ ] GET /settings
- [ ] PUT /settings
- [ ] GET /settings/permissions
- [ ] PUT /settings/permissions

### File Upload
- [ ] POST /files/upload
- [ ] GET /files/:id
- [ ] DELETE /files/:id
- [ ] Avatar upload support

### AI Features
- [ ] POST /ai/generate-tags
- [ ] POST /ai/generate-title

### Service Bridge Migration
- [ ] Rewrite `src/services/auth.service.ts`
- [ ] Rewrite `src/services/notes.service.ts`
- [ ] Rewrite `src/services/spaces.service.ts`
- [ ] Rewrite `src/services/tags.service.ts`
- [ ] Rewrite `src/services/ai.service.ts`
- [ ] Delete `src/mock/` directory
- [ ] Test all features end-to-end