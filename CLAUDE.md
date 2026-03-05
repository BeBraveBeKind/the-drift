# Claude Code Instructions for Switchboard

## Project Context
Switchboard is a community bulletin board platform that brings physical bulletin boards online. Built with Next.js, TypeScript, and Supabase, it enables community members to photograph and share local bulletin board postings, making them discoverable to a wider audience.

## Coding Conventions
- **TypeScript**: Use strict type checking. Define interfaces for all data structures
- **React/Next.js**: Use server components by default, client components only when needed
- **Styling**: Tailwind CSS for all styling. No inline styles unless absolutely necessary
- **File naming**: kebab-case for files, PascalCase for React components
- **Components**: Keep components small and focused. Extract reusable logic into custom hooks

## Project Structure
```
/app              # Next.js 14 app directory
  /[town]        # Dynamic town routes
    /[slug]      # Individual post pages
  /api           # API routes
  /demo          # Demo/prototype pages
/components      # Reusable React components
/lib             # Utility functions and configurations
/public          # Static assets
/supabase        # Database migrations and types
```

## Key Features & Implementation Notes
- **QR Code System**: Physical QR codes at bulletin board locations for verified uploads
- **Town-based routing**: Dynamic routes based on town slugs (/{town}/{slug})
- **Image handling**: Supabase Storage for bulletin board photos
- **Database**: Supabase PostgreSQL with Row Level Security
- **Admin panel**: Protected admin interface for managing locations and generating QR codes
- **Mobile-first**: Optimized for quick photo capture and sharing on mobile devices

## Testing & Quality
- Run `npm run lint` before committing
- Check TypeScript errors with `npm run build`
- Test on mobile viewports - this is a mobile-first application

## Environment Variables
Required env vars are documented in .env.example. Never commit actual env values.

## Session Management Instructions
At the end of each session, update PROGRESS.md with:
- What was accomplished
- Current blockers or open questions
- Next steps
- Any architectural decisions made and rationale
- Important context for the next session

## Important Guidelines
- NEVER commit secrets or API keys
- ALWAYS consider mobile UX first
- Maintain consistency with existing patterns in the codebase
- When adding new features, check if similar functionality exists first
- Update relevant documentation when making significant changes

## Git Workflow
- Main branch: main
- Commit messages should be clear and descriptive
- Do NOT commit unless explicitly asked by the user
- Always stash or properly handle uncommitted changes before switching branches