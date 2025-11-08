# AI Skill Assessment & Training Platform - SkillPath

## Overview

SkillPath is an AI-powered educational platform that provides personalized skill assessments and training recommendations. The platform uses adaptive quizzes to determine user skill levels, generates customized course recommendations, and includes an AI chatbot mentor to guide learners through their educational journey. Users can track their progress across multiple learning domains, manage their course enrollments, and schedule learning activities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server, providing fast HMR and optimized production builds
- **Wouter** for lightweight client-side routing instead of React Router
- **TanStack Query v5** for server state management, data fetching, and caching

**UI Component System**
- **shadcn/ui** (New York variant) as the base design system, built on Radix UI primitives
- **Tailwind CSS** for utility-first styling with custom design tokens
- **Material Design 3** principles guide the overall design approach
- Custom CSS variables in HSL format enable theme customization and dark mode support
- Typography uses Inter for UI elements and Poppins for display/headers

**State Management Strategy**
- Server state managed via TanStack Query with infinite stale time
- Local UI state uses React hooks (useState, useEffect)
- User session data persisted in localStorage (userId, selectedDomains, userName)
- No global state management library; data flows through component props and React Query cache

**Key Design Decisions**
- Mobile-first responsive design with breakpoints at 768px (md) and 1024px (lg)
- Accessibility-first approach using Radix UI primitives with ARIA attributes
- Reusable component library with examples for each major component
- Path aliases (@/, @shared/, @assets/) simplify imports and improve maintainability

### Backend Architecture

**Server Framework**
- **Express.js** with TypeScript running on Node.js
- ESM module system (type: "module" in package.json)
- Custom middleware for request logging and JSON body parsing with raw buffer capture
- Vite integration in development mode for SSR and HMR support

**API Design**
- RESTful endpoints under `/api` prefix
- POST `/api/user/onboard` - Creates users and stores domain preferences
- POST `/api/quiz/generate` - Generates AI-powered adaptive quizzes
- POST `/api/quiz/submit` - Processes quiz answers and determines skill levels
- Error responses include status codes and descriptive JSON messages
- Request/response logging captures method, path, status, duration, and truncated response bodies

**Authentication & Sessions**
- Currently uses demo authentication with generated user IDs
- Session data stored in localStorage on client side
- Production-ready session management uses `connect-pg-simple` for PostgreSQL-backed sessions
- User passwords stored (currently demo mode; would hash in production)

**AI Integration**
- **OpenAI API** integration for quiz generation and chatbot interactions
- Fallback quiz data ensures graceful degradation if AI service fails
- Quiz questions generated based on user's selected learning domains
- AI determines skill levels (Beginner/Intermediate/Advanced) from quiz performance

### Data Storage Solutions

**Database**
- **PostgreSQL** via Neon serverless with WebSocket support
- **Drizzle ORM** for type-safe database queries and schema management
- Connection pooling via `@neondatabase/serverless` Pool

**Schema Design**
- `users` - Stores user credentials and selected learning domains
- `domain_skill_levels` - Tracks determined skill level per domain per user
- `quiz_attempts` - Logs quiz questions, answers, scores, and skill assessments
- `enrolled_courses` - Manages course enrollments with progress tracking
- `chat_messages` - Stores AI chatbot conversation history
- `learning_schedules` - Tracks scheduled learning activities and completion status

**Data Access Layer**
- `DbStorage` class implements `IStorage` interface for testability
- CRUD operations use Drizzle query builder with `eq`, `and`, `desc` filters
- UUID primary keys generated via PostgreSQL's `gen_random_uuid()`
- JSONB columns store complex data (quiz questions/answers)
- Timestamps use PostgreSQL's `defaultNow()` function

**Migration Strategy**
- Schema defined in `shared/schema.ts` for client/server sharing
- Drizzle Kit configured to generate migrations in `./migrations` directory
- `npm run db:push` applies schema changes directly (development workflow)

### External Dependencies

**Third-Party Services**
- **OpenAI API** - Generates adaptive quiz questions and powers AI chatbot mentor
- **Neon Database** - Serverless PostgreSQL hosting with WebSocket support
- **Google Fonts** - Serves Inter and Poppins font families

**UI Component Libraries**
- **Radix UI** - Comprehensive suite of accessible, unstyled React primitives (accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, hover-card, label, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, switch, tabs, toast, tooltip, toggle)
- **cmdk** - Command palette component for keyboard-driven navigation
- **Lucide React** - Icon library providing consistent SVG icons
- **class-variance-authority** - Utility for creating variant-based component APIs
- **tailwind-merge** & **clsx** - Class name merging utilities

**Development Tools**
- **@replit/vite-plugin-runtime-error-modal** - Enhanced error overlay for development
- **@replit/vite-plugin-cartographer** - Code navigation and visualization
- **@replit/vite-plugin-dev-banner** - Development environment indicators
- **tsx** - TypeScript execution engine for Node.js
- **esbuild** - Bundles server code for production deployment

**Form & Validation**
- **react-hook-form** - Form state management and validation
- **@hookform/resolvers** - Validation schema resolvers
- **zod** & **drizzle-zod** - Runtime type validation and schema generation

**Date Handling**
- **date-fns** - Modern date manipulation library (alternative to moment.js)