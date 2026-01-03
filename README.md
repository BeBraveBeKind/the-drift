# Switchboard

A community bulletin board platform that brings physical bulletin boards online. Share what's posted in your local community boards and discover local happenings beyond social media.

## What is Switchboard?

Switchboard gives community bulletin boards a second life online. When someone posts a flyer on a physical board, visitors can take a photo and upload it to Switchboard, making local announcements discoverable to a wider community.

**Real. Local. Now.**

## Features

- **Town-based organization**: Each town has its own board collection
- **QR code posting**: Physical QR codes at each location enable authentic, location-verified uploads
- **Photo sharing**: Full bulletin board photos show everything that's currently posted
- **Mobile-first design**: Optimized for quick photo capture and sharing
- **Admin panel**: Easy location management and QR code generation

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage for photos
- **Styling**: Tailwind CSS with cork board aesthetic
- **Deployment**: Netlify
- **QR Codes**: Generated with qrcode library

## URL Structure

```
switchboard.town/                        → Landing page / town picker
switchboard.town/{town}                  → Town homepage (board grid)
switchboard.town/{town}/{slug}           → Individual location view
switchboard.town/post/{town}/{slug}      → Upload page (QR destination)
switchboard.town/about                   → About page
switchboard.town/how-to-post            → How to post guide
switchboard.town/admin                   → Admin panel
```

## Getting Started

1. **Clone and install**:
   ```bash
   npm install
   ```

2. **Environment setup**:
   Copy `.env.local.example` to `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Database setup**:
   Run the SQL files in this order:
   ```bash
   # 1. Basic schema
   psql -f schema.sql
   
   # 2. Storage policies
   psql -f storage-policies.sql
   
   # 3. Admin functions
   psql -f admin-functions.sql
   
   # 4. Migration for town support
   psql -f migration-add-town.sql
   psql -f update-admin-functions.sql
   
   # 5. Sample data (optional)
   psql -f test-data.sql
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Access the app**:
   - Main site: http://localhost:3000
   - Admin panel: http://localhost:3000/admin (password required)

## Database Schema

Key tables:
- `locations`: Bulletin board locations with town, slug, name, address
- `photos`: Uploaded photos linked to locations
- `analytics`: Page view and upload tracking

## Admin Features

- Add/edit/disable locations
- Generate QR codes for physical posting
- Town management
- View analytics
- Moderate content

## Deployment

Deploy to Netlify:

1. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`

2. **Environment variables**: Add the same variables from `.env.local`

3. **Domain**: Configure `switchboard.town` domain in Netlify

4. **Supabase CORS**: Add `switchboard.town` to allowed origins

## Design Philosophy

Switchboard celebrates the democratic, analog nature of community bulletin boards while extending their reach through digital tools. The cork board aesthetic preserves the tactile, handmade feeling of physical boards.

## Contributing

Built by Rise Above Partners with support from Ofigona, LLC.

For business inquiries about featuring your community board: michael@rise-above.net