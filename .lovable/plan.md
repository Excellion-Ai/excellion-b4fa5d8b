

# Add Custom Background Images to Course Builder

## What This Does
Adds the ability to upload and set custom background images on course landing page sections -- starting with the hero section. You'll be able to upload any image from the Design Settings modal, and it will appear as a background in your course preview and published course.

## Changes Overview

### 1. Extend the Design Config type to support background images
**File:** `src/types/course-pages.ts`

Add a `backgrounds` field to the existing `DesignConfig` interface:
```typescript
backgrounds?: {
  hero?: string;       // URL for hero section background
  curriculum?: string; // URL for curriculum section background  
  cta?: string;        // URL for CTA section background
};
```

### 2. Add background image upload controls to Design Settings modal
**File:** `src/components/secret-builder/visual-editing/DesignEditorModal.tsx`

- Import the existing `ImageUpload` component
- Add a new "Background Images" section below the existing Colors section
- Include upload controls for Hero, Curriculum, and CTA backgrounds
- Each shows a preview thumbnail with upload/remove functionality
- Store URLs in `design.backgrounds.hero`, etc.

### 3. Render background images in the course landing preview
**File:** `src/components/secret-builder/CourseLandingPreview.tsx`

- Read `course.design_config?.backgrounds?.hero` in the hero section renderer
- If a custom background URL exists, render it as a full-bleed background image with a dark overlay for text readability (similar to how `course.thumbnail` is currently used, but with higher opacity and priority)
- Apply the same pattern for curriculum and CTA sections if backgrounds are set

### 4. No database changes needed
The `design_config` column on the `courses` table is already a JSONB column, so adding `backgrounds` to it requires no schema migration.

## Technical Details

**Hero section background rendering (CourseLandingPreview.tsx, ~line 254):**

The current code uses `course.thumbnail` as a faint overlay. The updated logic will:
1. Check `course.design_config?.backgrounds?.hero` first (custom background takes priority)
2. Fall back to `course.thumbnail` if no custom background is set
3. Custom backgrounds render at higher opacity (0.4-0.5) for a more prominent effect

**DesignEditorModal.tsx -- new section (inserted after Colors):**

```text
Background Images
+------------------------------+
| Hero Background              |
| [Upload Image]  or [Preview] |
+------------------------------+
| Curriculum Background        |
| [Upload Image]  or [Preview] |
+------------------------------+
| CTA Background               |
| [Upload Image]  or [Preview] |
+------------------------------+
```

Each uses the existing `ImageUpload` component with `aspectRatio="banner"` for a wide preview.

**State flow:**
- User uploads image via `ImageUpload` -> gets public URL from storage
- URL stored in local `design` state as `design.backgrounds.hero`
- On "Apply Design", saved to `courses.design_config` JSONB in the database
- `CourseLandingPreview` reads from `course.design_config.backgrounds.hero` and renders it

