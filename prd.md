Absolutely bro. 🔥 Since your **Supabase backend is already completed**, the PRD should tell Antigravity **not to rebuild the backend** and focus on building the website on top of what you've already created.

Copy-paste the entire prompt below into Antigravity.

---

# APK HUB — WEBSITE PRD + ANTIGRAVITY BUILD PROMPT

## 1. PROJECT CONTEXT

I am building a website called **APK Hub** — a modern Android APK discovery and download platform.

### IMPORTANT: BACKEND IS ALREADY DONE

I have already completed the Supabase backend setup.

**DO NOT recreate, replace, or duplicate my existing Supabase backend.**

The following are already configured:

### Supabase Project

Project URL:

```text
https://yadbuyueeefgmawsipgm.supabase.co
```

### Existing database tables

```text
public.apps
public.app_versions
public.app_screenshots
public.categories
public.profiles
```

### Existing Storage bucket

```text
app-assets
```

The bucket is public and already contains the APK:

```text
app-release (1).apk
```

Current APK public URL:

```text
https://yadbuyueeefgmawsipgm.supabase.co/storage/v1/object/public/app-assets/app-release%20(1).apk
```

---

# 2. EXISTING DATABASE DATA

I have already created the first app:

### App

```text
Name: APK Hub
Slug: apk-hub
ID: ab93cf67-07a8-48eb-b07d-2480b2741408
```

### Current release

```text
Version: 1.0.0
APK size: 7590000 bytes
Android version: Android
Architecture: arm64-v8a
What's new: Initial release
Is current: true
```

The relationship between:

```text
apps
   ↓
app_versions
```

has already been tested successfully.

The website must fetch this information dynamically from Supabase.

---

# 3. EXISTING SUPABASE EDGE FUNCTION

I have also created and deployed this Supabase Edge Function:

```text
github-release-manager
```

It is connected to GitHub using a server-side secret:

```text
GITHUB_TOKEN
```

The GitHub repository configured in the function is:

```text
Owner: praveen801771-cmd
Repository: apk-hub-releases
```

The GitHub token is stored securely inside Supabase Edge Function Secrets.

### IMPORTANT SECURITY RULE

Never expose:

```text
GITHUB_TOKEN
```

in the frontend.

Never put it inside:

```text
.env frontend variables
JavaScript
React components
browser requests
HTML
```

The GitHub token must remain server-side.

---

# 4. YOUR TASK

Now build the **APK Hub frontend website** using the existing Supabase backend.

Do not create fake/mock app data if real Supabase data is available.

The website must be production-ready and responsive.

---

# 5. TECHNOLOGY

Use a modern frontend stack appropriate for this project.

Preferred:

```text
React
TypeScript
Vite
Tailwind CSS
Supabase JavaScript client
```

Use reusable components and clean architecture.

Do not create unnecessary dependencies.

---

# 6. DESIGN DIRECTION

Create a **professional modern APK marketplace UI**.

The website should feel like a real Android app marketplace rather than a basic CRUD dashboard.

### Design characteristics

* Modern
* Clean
* Premium
* Fast
* Mobile-first
* Responsive
* Minimal
* Professional
* Strong typography
* Excellent spacing
* Smooth animations
* Accessible
* Dark/light theme support if practical

Avoid:

* Generic template appearance
* Excessive gradients
* Excessive glass effects
* Huge empty sections
* Clutter
* Too many animations
* Fake statistics
* Fake reviews
* Fake download numbers

---

# 7. BRAND

## Name

**APK Hub**

## Tagline

Use a suitable tagline such as:

> Discover. Download. Enjoy.

or

> Your trusted Android APK hub.

Keep branding professional.

Create a simple text/icon-based APK Hub logo if no logo asset exists.

---

# 8. WEBSITE PAGES

Build the following pages.

---

## PAGE 1 — HOME

Route:

```text
/
```

### Hero section

Show:

**APK Hub**

Headline:

> Discover the apps you need.

Supporting text explaining that users can discover and download Android applications.

Include:

```text
Search apps...
```

Search bar should work.

---

### Featured apps

Fetch featured applications from:

```text
public.apps
```

using the `featured` field.

Do not hardcode applications.

If no featured apps exist, gracefully hide this section or show latest apps instead.

---

### Latest releases

Fetch applications with their current/latest version.

Display:

* App icon
* App name
* Description
* Version
* Category
* APK size
* Download button

---

### Categories

Fetch categories dynamically from:

```text
public.categories
```

Show category cards.

Existing categories include:

```text
Productivity
Games
Education
Finance
Tools
Entertainment
Lifestyle
Other
```

Do not hardcode these as the database source of truth.

---

# 9. PAGE 2 — APPS

Route:

```text
/apps
```

Create an app discovery page.

Include:

### Search

Users can search applications by:

* Name
* Description

### Filters

Allow filtering by:

* Category
* Featured
* Latest

### App grid

Display responsive cards.

Desktop:

```text
4 columns approximately
```

Tablet:

```text
2–3 columns
```

Mobile:

```text
1–2 columns
```

Do not use fixed widths that break mobile layouts.

---

# 10. PAGE 3 — APP DETAILS

Route:

```text
/apps/:slug
```

Example:

```text
/apps/apk-hub
```

Fetch the app using its slug.

Display:

### App header

* App icon
* App name
* Description
* Developer
* Category
* Featured status

### Current release

Display:

```text
Version
APK size
Android version
Architecture
Release date
What's new
```

### Download button

Large primary button:

```text
Download APK
```

The button must use the actual:

```text
app_versions.apk_url
```

from Supabase.

Do NOT hardcode the APK URL.

---

# 11. DOWNLOAD BEHAVIOR

When the user clicks:

```text
Download APK
```

download the current APK.

The website should use the release where:

```text
is_current = true
```

If multiple releases exist, always identify the current release correctly.

If no current release exists:

Show:

> No active release available.

Do not show a broken download button.

---

# 12. APP ICONS

Use:

```text
apps.icon_url
```

for application icons.

If `icon_url` is empty:

Use a professional default APK/app placeholder.

Do not break the layout because an icon is missing.

---

# 13. SCREENSHOTS

Use:

```text
app_screenshots
```

on the app details page.

Display screenshots in a responsive gallery.

Use:

```text
image_url
sort_order
```

to determine ordering.

If an app has no screenshots, hide the screenshot section.

---

# 14. CATEGORY PAGE

Route:

```text
/categories/:slug
```

Example:

```text
/categories/games
```

Fetch category by slug.

Then display apps belonging to that category.

Include:

* Category title
* Description if available
* App count
* App grid
* Search/filter

---

# 15. NAVIGATION

Desktop navbar:

```text
APK Hub
Home
Apps
Categories
Search
```

Add a theme toggle if implemented.

Mobile:

Use a mobile-friendly navigation menu.

The navigation must remain usable on small screens.

---

# 16. FOOTER

Include:

```text
APK Hub
Discover. Download. Enjoy.

Home
Apps
Categories

Privacy
Terms
Contact

© 2026 APK Hub
```

Do not create fake legal claims.

---

# 17. SUPABASE INTEGRATION

Create a single Supabase client.

Use environment variables for public Supabase configuration.

Example:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

The publishable/anon key may be used in the browser according to Supabase's frontend model.

### NEVER expose

```text
GITHUB_TOKEN
SUPABASE_SECRET_KEYS
SUPABASE_SERVICE_ROLE_KEY
```

in the frontend.

---

# 18. DATA FETCHING

Create a clean data layer.

For example:

```text
src/
  components/
  pages/
  lib/
    supabase.ts
    api/
      apps.ts
      categories.ts
      releases.ts
  types/
  hooks/
```

Create reusable functions such as:

```text
getApps()
getAppBySlug()
getFeaturedApps()
getLatestApps()
getCategories()
getAppsByCategory()
getCurrentRelease()
getAppScreenshots()
```

Avoid putting large Supabase queries directly inside UI components.

---

# 19. APP + RELEASE QUERY

The frontend needs to understand that an application and its APK release are separate database records.

Conceptually:

```text
apps
  ↓
app_versions
```

Use the `app_id` relationship.

For the current release:

```text
app_versions.app_id = apps.id
AND
app_versions.is_current = true
```

Do not assume the APK URL exists directly on `apps`.

---

# 20. LOADING STATES

Every Supabase-powered page must have proper loading states.

Use:

* Skeleton cards
* Loading indicators
* Smooth transitions

Avoid showing blank screens.

---

# 21. ERROR STATES

If Supabase fails:

Show a friendly error:

> Something went wrong while loading apps.

Provide:

```text
Try again
```

Do not expose raw database errors to users.

---

# 22. EMPTY STATES

Examples:

No apps:

> No apps found.

No search results:

> We couldn't find any apps matching your search.

No screenshots:

Don't display an empty screenshot container.

No current release:

> No active release available.

---

# 23. SEARCH

Implement real search.

Search should work against the loaded Supabase app data or through an appropriate Supabase query.

Search fields:

```text
name
short_description
description
```

Search should have:

* Debouncing where appropriate
* Empty state
* Clear button
* Mobile-friendly UI

---

# 24. RESPONSIVE DESIGN

This is extremely important.

The website must work properly on:

```text
Mobile
Tablet
Laptop
Desktop
Large desktop
```

Test at approximately:

```text
360px
390px
430px
768px
1024px
1280px
1440px
```

No:

* Horizontal overflow
* Broken cards
* Overlapping text
* Buttons going off screen
* Navigation overflow

---

# 25. PERFORMANCE

Optimize for fast loading.

Requirements:

* Lazy-load images where appropriate
* Optimize screenshot rendering
* Avoid unnecessary database requests
* Avoid fetching huge datasets unnecessarily
* Use reusable queries
* Cache data where appropriate
* Avoid unnecessary React re-renders

---

# 26. SECURITY

Follow these rules strictly.

### Frontend can contain:

```text
Supabase URL
Supabase publishable/anon key
```

### Frontend must NEVER contain:

```text
GITHUB_TOKEN
service role key
secret keys
private GitHub credentials
```

Do not attempt to access Supabase secrets from the browser.

---

# 27. SUPABASE RLS

Before production, inspect the existing RLS policies.

The public website should be able to read only the information required for public app discovery.

Do not disable RLS just to make the website work.

If a required public SELECT policy is missing, tell me exactly which policy is needed instead of disabling security.

---

# 28. ADMIN FUNCTIONALITY

Do not build the full admin dashboard in the first frontend implementation.

The initial website should focus on:

```text
Public APK marketplace
```

The existing:

```text
github-release-manager
```

Edge Function should remain server-side.

Admin/release management can be added later.

---

# 29. REAL DATA ONLY

The website must use my actual Supabase data.

Currently the database contains:

```text
APK Hub
Version 1.0.0
```

The site should therefore be able to display this app automatically.

Do not create fake apps such as:

```text
WhatsApp
Instagram
Spotify
Facebook
```

unless they actually exist in my database.

---

# 30. IMPORTANT: DO NOT DESTROY EXISTING WORK

Before changing anything:

1. Inspect the existing project.
2. Understand the current code.
3. Preserve existing functionality.
4. Reuse existing components where appropriate.
5. Do not overwrite working functionality unnecessarily.
6. Do not recreate Supabase tables.
7. Do not create a second storage bucket.
8. Do not create duplicate Edge Functions.
9. Do not replace the existing database schema.

---

# 31. DEVELOPMENT WORKFLOW

Work in stages.

## Stage 1

Inspect the existing project and identify:

* Current framework
* Existing routes
* Existing components
* Existing Supabase configuration
* Existing environment variables

Then report what you found.

## Stage 2

Build the core APK Hub UI:

```text
Home
Apps
App Details
Categories
Navigation
Footer
```

## Stage 3

Connect the UI to Supabase.

## Stage 4

Implement:

```text
Search
Category filtering
Current releases
APK downloads
Screenshots
```

## Stage 5

Add:

```text
Loading states
Error states
Empty states
Responsive behavior
```

## Stage 6

Production review.

---

# 32. PRODUCTION CHECKLIST

Before declaring the website complete, verify:

### Database

* [ ] Apps load from Supabase
* [ ] Categories load from Supabase
* [ ] Releases load from Supabase
* [ ] Screenshots load from Supabase

### APK

* [ ] APK URL comes from database
* [ ] Download button works
* [ ] Current release is correctly selected
* [ ] APK metadata displays correctly

### UI

* [ ] Desktop works
* [ ] Tablet works
* [ ] Mobile works
* [ ] Navigation works
* [ ] Search works
* [ ] Categories work
* [ ] App details work

### Security

* [ ] No GitHub token in frontend
* [ ] No service-role key in frontend
* [ ] No Supabase secret key in frontend
* [ ] RLS has not been disabled unnecessarily

### Quality

* [ ] No console errors
* [ ] No broken images
* [ ] No broken links
* [ ] No horizontal scrolling
* [ ] No fake data
* [ ] No hardcoded APK URLs
* [ ] No unnecessary duplicate API calls

---

# 33. FINAL GOAL

The finished website should feel like a **real professional APK marketplace**.

The user flow should be:

```text
                    APK HUB
                       │
                       ▼
                    HOME
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
        SEARCH      CATEGORIES     LATEST
          │            │            │
          └────────────┼────────────┘
                       ▼
                  APP DETAILS
                       │
                       ▼
                 CURRENT RELEASE
                       │
                       ▼
                  DOWNLOAD APK
                       │
                       ▼
              SUPABASE STORAGE
```

### MOST IMPORTANT INSTRUCTION

**I have already completed the Supabase backend, Storage bucket, database tables, APK upload, database records, GitHub token setup, and `github-release-manager` Edge Function.**

**Your job now is to build the frontend website on top of this existing infrastructure.**

**Do not rebuild the backend. Inspect it, integrate with it, and build the APK Hub website.**

Start by inspecting the existing project and then implement **Stage 1: the complete APK Hub website UI**.
