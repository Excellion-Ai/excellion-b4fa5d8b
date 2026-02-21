

# Fix: Course Database Persistence

## The Problem
Courses show up in the builder preview but are never saved to the database. The courses table stays empty because save operations silently fail without any user feedback.

## Root Causes Found

### 1. Silent failures with no user feedback
When `saveCourseToDatabase` fails, it returns `null` and logs to the console, but the user is never told. The course looks fine in the builder (because it's in local state) but doesn't exist in the database.

### 2. Broken save chain
The initial save must succeed to set `courseId` state. If it fails, the auto-save system (which syncs edits every 1.5 seconds) checks `if (courseSpec && courseId)` -- since `courseId` is null, ALL future edits are also never saved. One failure breaks everything permanently for that session.

### 3. UUID handling issue
The edge function generates a UUID client-side (`generateUUID()`) and passes it back. The frontend then passes this as `existingId` to `saveCourseToDatabase`, which triggers the upsert path. But if any unique constraint (like `subdomain`) fails during an upsert, the retry logic may not handle it correctly.

### 4. Missing subdomain in prebuilt template path  
The prebuilt template save in the edge function doesn't include a `subdomain` field, which could cause silent constraint issues.

## The Fix

### Step 1: Rewrite `saveCourseToDatabase` for reliability
- Remove the `existingId`/upsert path for NEW courses -- always use `insert` for new courses
- Let Postgres generate the UUID (remove client-side ID)
- Add proper error toasts so users KNOW when a save fails
- Add detailed error logging for every failure case

### Step 2: Add retry/recovery to BuilderShell
- If the initial save fails, show a toast with "Retry" action
- Store the course data and retry on the next auto-save cycle
- The auto-save system should attempt to create the course row if `courseId` is still null (not just update)

### Step 3: Fix the auto-save to handle missing courseId
- Currently auto-save only calls `updateCourseInDatabase` when `courseId` exists
- Change it to call `saveCourseToDatabase` (insert) when `courseId` is null but `courseSpec` exists
- This gives the system multiple chances to persist the course instead of giving up after one try

### Step 4: Fix prebuilt template edge function
- Add `subdomain` field to the prebuilt template course insert in `generate-course/index.ts`

## Files to Change

1. **`src/lib/coursePersistence.ts`** -- Simplify save logic, add toast feedback, remove fragile upsert path for new courses
2. **`src/components/secret-builder/BuilderShell.tsx`** -- Fix auto-save to retry initial save when courseId is null; add error toasts
3. **`supabase/functions/generate-course/index.ts`** -- Add subdomain to prebuilt template insert

## Technical Details

### coursePersistence.ts changes
- `saveCourseToDatabase`: Always use INSERT (not upsert) for new courses. Let Postgres auto-generate the `id`. Keep the subdomain retry logic. Add `toast.error()` on failure.
- `updateCourseInDatabase`: Add toast feedback on failure.
- New export: `ensureCourseExists(params)` -- checks if course exists by builder_project_id, creates if not, returns the course id. Used by auto-save as a safety net.

### BuilderShell.tsx changes  
- After `saveCourseToDatabase` call (line 1041): If it returns null, show `toast.error('Failed to save course to database. Retrying...')` 
- In auto-save effect (line 808): If `courseSpec` exists but `courseId` is null, attempt `saveCourseToDatabase` instead of `updateCourseInDatabase`
- This means the system will retry saving on every 1.5s auto-save cycle until it succeeds

### generate-course/index.ts changes
- Add `subdomain: slugify(prebuiltCourse.title) + '-' + Math.random().toString(36).substring(2,8)` to the prebuilt template course insert

