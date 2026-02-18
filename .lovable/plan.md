
# Remove Bottom Action Bar from Course Builder

## What's Changing
The fixed bottom footer bar (showing "Saved", "Save Draft", "Preview", and "Publish Course" buttons) will be permanently removed. As you noted:
- **Publish** already exists in the top-right header
- **Preview** is redundant since you're already viewing the preview
- **Save Draft / Saved** is unnecessary because auto-save handles everything

## Changes

### 1. Remove the CourseActionBar usage from BuilderShell
**File:** `src/components/secret-builder/BuilderShell.tsx`
- Delete the entire `CourseActionBar` block (lines 2816-2867) that renders the sticky bottom bar
- Remove the `CourseActionBar` import at the top of the file

### 2. Delete the CourseActionBar component file
**File:** `src/components/secret-builder/CourseActionBar.tsx`
- This file becomes unused and will be deleted entirely

No other files reference `CourseActionBar`, so this is a clean removal with no side effects.
