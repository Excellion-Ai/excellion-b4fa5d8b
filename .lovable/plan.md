

# Fix: Courses Disappearing After Login

## Problem
The `SecretBuilderHub` page fetches courses in a `useEffect` with an empty dependency array (`[]`), meaning it runs exactly once on mount. It calls `supabase.auth.getUser()` to get the current user, but if the auth session hasn't finished restoring from storage yet, this returns `null` -- so the course query is skipped entirely, showing "No courses yet."

This is a classic race condition: the component mounts and fetches before auth is ready.

## Solution
Add an auth state listener (`onAuthStateChange`) so that courses are re-fetched whenever the user's session is confirmed. This ensures that even if auth restoration takes a moment, the data loads correctly once the session is available.

## Technical Details

**File:** `src/pages/SecretBuilderHub.tsx` (lines 261-309)

**Current code:**
```typescript
useEffect(() => {
  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    // ... fetches courses only if user exists
  };
  fetchData();
}, []);
```

**Updated approach:**
```typescript
useEffect(() => {
  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    // ... same fetch logic
  };

  fetchData();

  // Re-fetch when auth state changes (e.g., session restored)
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchData();
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

This ensures that:
1. An initial fetch is attempted immediately (works if session is already available).
2. If auth is still loading, the `SIGNED_IN` event fires once the session is restored, triggering a second fetch that will now find the user and load their courses.

No database or schema changes are needed -- the courses are confirmed to still exist in the database.
