import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000000";

const CANONICAL_MODULES = [
  {
    id: "m1",
    title: "Prompt Call (Start Here)",
    description: "Get to your first usable draft in one call.",
    lessons: [
      {
        id: "m1l1",
        title: "What the call covers and how long it takes",
        type: "text",
        duration_minutes: 3,
        duration: "3 min",
        is_preview: true,
        content_markdown:
          "## What the Prompt Call Covers\n\nThe prompt call is a 5-minute guided conversation with the Excellion voice agent. It asks you about your offer, your audience, and your pricing — then generates a full course prompt you can review and edit.\n\n### What you'll walk away with\n- A complete course prompt ready to generate your draft\n- Clarity on your offer, audience, and pricing structure\n\n**Output:** A generated prompt saved to your dashboard.",
      },
      {
        id: "m1l2",
        title: "Preparing your answers (offer, audience, pricing)",
        type: "text",
        duration_minutes: 3,
        duration: "3 min",
        content_markdown:
          "## Prepare Before You Call\n\nBefore starting the voice call, have these three things ready:\n\n1. **Your offer** — What transformation does your course deliver? (e.g., \"Lose 10 lbs in 6 weeks\")\n2. **Your audience** — Who is this for? Be specific. (e.g., \"Busy dads over 35 who haven't worked out in years\")\n3. **Your pricing** — Free, one-time payment, or subscription? What price point?\n\nWrite these down before you start. The call will be faster and your draft will be better.\n\n**Output:** Three written answers ready for the call.",
      },
      {
        id: "m1l3",
        title: "Start the voice call agent",
        type: "text",
        duration_minutes: 5,
        duration: "5 min",
        content_markdown:
          "## Start the Voice Call\n\nClick the \"Start Prompt Call\" button on your dashboard. The agent will:\n\n1. Ask about your offer and transformation promise\n2. Ask about your ideal student\n3. Ask about pricing and delivery format\n4. Generate your prompt in real time\n\nSpeak naturally — the agent understands conversational language. You can restart the call anytime.\n\n**Output:** A completed voice call with your prompt generated.",
      },
      {
        id: "m1l4",
        title: "Review your generated prompt",
        type: "text",
        duration_minutes: 2,
        duration: "2 min",
        content_markdown:
          "## Review Your Prompt\n\nAfter the call, your prompt appears on your dashboard. Read through it and check:\n\n- Does the audience description match who you want to serve?\n- Does the transformation promise sound right?\n- Is the pricing and format correct?\n\nYou can edit the prompt text directly before generating. Small tweaks here save regeneration time later.\n\n**Output:** A reviewed and finalized prompt ready to generate your course.",
      },
    ],
  },
  {
    id: "m2",
    title: "Generate + Review Your Draft",
    description: "Generate the draft and quickly QA it.",
    lessons: [
      {
        id: "m2l1",
        title: "Course structure walkthrough",
        type: "text",
        duration_minutes: 4,
        duration: "4 min",
        content_markdown:
          "## Your Course Structure\n\nAfter generating, your course will have:\n\n- **Modules** — The major sections (usually 4-8)\n- **Lessons** — Individual topics within each module\n- **Sales page** — A landing page with headline, outcomes, curriculum preview, and CTA\n\nOpen each module and skim the lesson titles. Are they in a logical order? Does anything feel missing or redundant?\n\n**Output:** A mental map of your course structure and any notes on what to change.",
      },
      {
        id: "m2l2",
        title: "Sales page and pricing overview",
        type: "text",
        duration_minutes: 3,
        duration: "3 min",
        content_markdown:
          "## Review Your Sales Page\n\nYour generated sales page includes:\n\n- Hero headline and subheadline\n- \"What you'll learn\" outcomes\n- Curriculum preview\n- FAQ section\n- Pricing and CTA button\n\nRead the headline first — does it promise the right transformation? Check that the outcomes match what your course actually teaches.\n\n**Output:** A list of sections you want to keep, edit, or regenerate.",
      },
      {
        id: "m2l3",
        title: "Identify sections to regenerate",
        type: "text",
        duration_minutes: 3,
        duration: "3 min",
        content_markdown:
          "## Flag What Needs Work\n\nGo through your draft and mark sections that need changes:\n\n- ❌ **Regenerate** — The section is off-topic or wrong tone\n- ✏️ **Edit** — Close but needs manual tweaks\n- ✅ **Keep** — Good as-is\n\nDon't try to fix everything manually. In the next module, you'll learn how to regenerate any section with a single command.\n\n**Output:** A prioritized list of sections to regenerate in Module 3.",
      },
    ],
  },
  {
    id: "m3",
    title: "Regenerate Anything",
    description: "Use prompt-driven iteration to perfect any section.",
    lessons: [
      {
        id: "m3l1",
        title: "How the command prompt works",
        type: "text",
        duration_minutes: 3,
        duration: "3 min",
        content_markdown:
          "## The Command Prompt\n\nThe command prompt is a text box in your course editor. Type a natural-language instruction and Excellion regenerates the targeted section.\n\nExamples:\n- \"Rewrite the Module 2 intro to be more motivational\"\n- \"Make the FAQ answers shorter and punchier\"\n- \"Add a lesson about meal prep to Module 3\"\n\nThe command prompt understands context — it knows your course structure, audience, and tone.\n\n**Output:** Understanding of how to use the command prompt for any edit.",
      },
      {
        id: "m3l2",
        title: "Regenerate lesson scripts and module intros",
        type: "text",
        duration_minutes: 5,
        duration: "5 min",
        content_markdown:
          "## Regenerate Course Content\n\nTo regenerate a lesson or module intro:\n\n1. Navigate to the lesson or module in your editor\n2. Open the command prompt\n3. Type your instruction (e.g., \"Rewrite this lesson to focus on practical steps, not theory\")\n4. Review the new version\n5. Accept or regenerate again\n\nTip: Be specific about what you want changed. \"Make it better\" is vague. \"Make it more actionable with 3 concrete steps\" gives better results.\n\n**Output:** At least one lesson or module intro regenerated to your satisfaction.",
      },
      {
        id: "m3l3",
        title: "Regenerate sales page sections",
        type: "text",
        duration_minutes: 5,
        duration: "5 min",
        content_markdown:
          "## Regenerate Sales Page Sections\n\nYour sales page sections can be individually regenerated:\n\n- **Hero** — \"Rewrite the headline to emphasize speed of results\"\n- **Outcomes** — \"Add 2 more learning outcomes focused on confidence\"\n- **FAQ** — \"Rewrite FAQ #3 to address the 'no time' objection\"\n- **CTA** — \"Make the final CTA more urgent\"\n\nEach section regenerates independently. You won't lose other sections when you change one.\n\n**Output:** At least one sales page section regenerated.",
      },
      {
        id: "m3l4",
        title: "Regenerate downloads and resources",
        type: "text",
        duration_minutes: 4,
        duration: "4 min",
        content_markdown:
          "## Regenerate Downloads\n\nIf your course includes downloadable resources (PDFs, worksheets, checklists), you can regenerate them:\n\n- \"Create a weekly meal prep checklist for Module 2\"\n- \"Generate a workout log template for students\"\n- \"Add a progress tracking spreadsheet\"\n\nGenerated resources appear in your course's resource library and can be attached to specific lessons.\n\n**Output:** At least one downloadable resource generated or updated.",
      },
      {
        id: "m3l5",
        title: "Batch prompts for multiple sections",
        type: "text",
        duration_minutes: 4,
        duration: "4 min",
        content_markdown:
          "## Batch Prompts\n\nYou can chain multiple instructions in one command to save time:\n\n```\nRewrite all Module 1 lessons to use a coaching tone.\nShorten every FAQ answer to 2 sentences max.\nAdd a \"Quick Win\" callout box to the first lesson of each module.\n```\n\nBatch prompts process each instruction sequentially. Review all changes before accepting.\n\n**Output:** Multiple sections updated in a single batch.",
      },
      {
        id: "m3l6",
        title: "Preview your full result",
        type: "text",
        duration_minutes: 4,
        duration: "4 min",
        content_markdown:
          "## Full Preview\n\nBefore publishing, do a final review:\n\n1. **Sales page** — Read top to bottom as if you're a potential student\n2. **Curriculum** — Open every module and check lesson order\n3. **Lesson content** — Spot-check 2-3 lessons for tone and accuracy\n4. **Mobile view** — Preview on your phone to check formatting\n\nIf anything feels off, regenerate it now. It's faster to fix before publishing.\n\n**Output:** A fully reviewed course ready to publish.",
      },
    ],
  },
  {
    id: "m4",
    title: "Publish + Go Live",
    description: "Connect your domain and go live with confidence.",
    lessons: [
      {
        id: "m4l1",
        title: "Final preview and domain setup",
        type: "text",
        duration_minutes: 5,
        duration: "5 min",
        content_markdown:
          "## Final Preview & Domain Setup\n\nBefore publishing:\n\n1. **Preview your sales page** — Click \"Preview\" to see exactly what students will see\n2. **Check your URL** — You can use the default Excellion link or connect a custom domain\n3. **Connect a domain** — Go to Settings → Domains → Add your domain and follow the DNS instructions\n\nDomain propagation takes 1-24 hours. You can publish on your Excellion link immediately and add the custom domain later.\n\n**Output:** Your course is previewed and your URL is ready.",
      },
      {
        id: "m4l2",
        title: "Publish and share your live link",
        type: "text",
        duration_minutes: 5,
        duration: "5 min",
        content_markdown:
          "## Publish Your Course\n\nWhen you're ready:\n\n1. Click **Publish** in your course editor\n2. Your course goes live immediately\n3. Copy your shareable link\n4. Share it on social media, email, or anywhere your audience is\n\nAfter publishing, you can still edit and regenerate. Changes go live instantly.\n\n**Output:** Your course is live and shareable. You did it! 🎉",
      },
    ],
  },
];

const CANONICAL_COURSE = {
  title: "Excellion Quickstart",
  description:
    "Launch your first course in 1 weekend. This free quickstart walks you through the prompt call, draft review, regeneration, and publishing workflow.",
  subdomain: "quickstart",
  status: "published",
  difficulty: "beginner",
  duration_weeks: 1,
  price_cents: 0,
  currency: "USD",
  user_id: SYSTEM_USER_ID,
  offer_type: "standard",
  layout_template: "suspended",
  modules: CANONICAL_MODULES,
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let forceReset = false;
    try {
      const body = await req.json();
      forceReset = body?.force_reset === true;
    } catch {
      // No body or invalid JSON is fine
    }

    // Check if course exists
    const { data: existing } = await supabase
      .from("courses")
      .select("id, status, published_at")
      .eq("subdomain", "quickstart")
      .maybeSingle();

    if (existing && !forceReset) {
      // Ensure it's published
      if (existing.status !== "published" || !existing.published_at) {
        await supabase
          .from("courses")
          .update({
            status: "published",
            published_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      }
      return new Response(
        JSON.stringify({ success: true, course_id: existing.id, action: "ensured_published" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (existing && forceReset) {
      // Overwrite modules with canonical curriculum
      const { error } = await supabase
        .from("courses")
        .update({
          modules: CANONICAL_MODULES as any,
          title: CANONICAL_COURSE.title,
          description: CANONICAL_COURSE.description,
          status: "published",
          published_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, course_id: existing.id, action: "force_reset" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert new course
    const { data: newCourse, error: insertError } = await supabase
      .from("courses")
      .insert({
        ...CANONICAL_COURSE,
        published_at: new Date().toISOString(),
        modules: CANONICAL_MODULES as any,
      })
      .select("id")
      .single();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ success: true, course_id: newCourse.id, action: "created" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("seed-quickstart error:", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
