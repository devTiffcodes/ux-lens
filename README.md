# UX Lens

UX Lens is a developer-oriented research tool for studying how web interface design affects digital wellbeing — cognitive load, emotional wellbeing, visual comfort, and overall experience — not just task completion.

It was built as the practical component of a final year Diploma project (University of Seychelles) investigating the relationship between interface design and digital wellbeing.

## Overview

UX Lens has two sides:

- **Researcher dashboard** — configure studies, toggle interface conditions, view aggregated results (including a radar chart across five UX dimensions), inspect task completion rates, review individual participant responses, and query an AI mentor for UX feedback and recommendations.
- **Mera** — a mock Seychelles community platform (Home, Events, Noticeboard, Local Information, Contact) that serves as the controlled, participant-facing test environment. Mera can be switched between two interface conditions using a researcher-controlled toggle:
  - **Good UX** — clear visual hierarchy, strong contrast, simplified interaction.
  - **Poor UX** — a `poor-ux` CSS class override introducing WCAG-failing patterns: reduced contrast, smaller text, weaker hierarchy, misleading placement, and denser information.

Content and task structure stay identical across both conditions, so any difference in participant experience can be attributed to interface design rather than content.

## Live App
https://ux-lens-one.vercel.app/

## Tech Stack

- **Angular 17+** — component architecture, TypeScript, routing, dependency injection
- **Firebase Authentication** — email/password and Google OAuth sign-in
- **Firestore** — real-time, document-based data storage
- **Vercel** — deployment, with serverless functions for backend API calls
- **Gemini API** — powers the AI mentor feature (accessed via a Vercel serverless function)

## Architecture

The app follows a four-layer structure:

```
src/
├── domain/   # Core data models and business logic
├── data/     # Firebase/Firestore communication
├── feature/  # Pages and components (UX Lens + Mera)
└── core/     # Shared services, guards, interceptors
```

### Firestore collections

| Collection  | Purpose                                                              |
| ----------- | --------------------------------------------------------------------- |
| `users`     | User profile: ID, email, display name, role (`researcher` \| `participant`) |
| `studies`   | Research study configurations created by researchers                 |
| `responses` | Participant survey responses, linked to `studyId` and `userId`        |

### Roles

Every new user is assigned a default role of `participant` on first login (`auth.service.ts` → `loadOrCreateUser`). Role determines routing:

- `participant` → Mera
- `researcher` → UX Lens dashboard

Upgrading a user to `researcher` currently requires direct Firestore edits; there is no admin UI for role management yet.

## Getting Started

### Prerequisites

- Node.js and npm
- A Firebase project with Authentication and Firestore enabled
- A Gemini API key (for the AI mentor feature)

### Environment variables

Create a `.env` (or Vercel project environment variables) with your Firebase config and Gemini API key. See `src/environments/` for the expected shape.

### Development server

```bash
ng serve
```

Open `http://localhost:4200/`. The app reloads automatically on source changes.

### Code scaffolding

```bash
ng generate component component-name
```

Run `ng generate --help` for the full list of schematics (components, directives, pipes, etc.).

### Building

```bash
ng build
```

Build artifacts are output to `dist/`. Production builds are optimised by default.

### Running unit tests

```bash
ng test
```

Uses [Vitest](https://vitest.dev/) as the test runner.

### Running end-to-end tests

```bash
ng e2e
```

Angular CLI doesn't ship with an e2e framework by default — none is currently configured for this project.

## Known Limitations

- The Gemini API is a third-party dependency; the AI mentor feature depends on external API availability and credit limits.
- Mera uses static mock content rather than live community data.
- Role assignment (participant → researcher) requires manual Firestore changes.
- All wellbeing data collected via the platform is self-reported.

## Additional Resources

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) v22.0.6. For CLI usage and command references, see the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli).
