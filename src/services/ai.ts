import { supabase } from "@/integrations/supabase/client"

/**
 * Centralized AI service — all AI/LLM calls route through
 * Supabase Edge Functions. No direct provider imports.
 */
export const AI = {
  // ─── Course Generation ───
  async generateCourse(prompt: string, options: Record<string, unknown> = {}) {
    const { data, error } = await supabase.functions.invoke("generate-course", {
      body: { prompt, options },
    })
    if (error) throw error
    return data
  },

  // ─── Course Design Commands ───
  async interpretCommand(command: string, currentCourse: unknown, currentDesign: unknown) {
    const { data, error } = await supabase.functions.invoke("interpret-course-command", {
      body: { command, current_course: currentCourse, current_design: currentDesign },
    })
    if (error) throw error
    return data
  },

  // ─── Builder Agent (site spec generation) ───
  async builderAgent(payload: Record<string, unknown>) {
    const { data, error } = await supabase.functions.invoke("builder-agent", {
      body: payload,
    })
    if (error) throw error
    return data
  },

  // ─── Code Generation ───
  async generateCode(payload: Record<string, unknown>) {
    const { data, error } = await supabase.functions.invoke("code-agent", {
      body: payload,
    })
    if (error) throw error
    return data
  },

  // ─── Chatbot (streaming — returns raw Response) ───
  async chatStream(messages: unknown[], extras: Record<string, unknown> = {}) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) throw new Error("Session expired. Please sign in again.")

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bot-chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ messages, ...extras }),
      }
    )
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || "Failed to get AI response")
    }
    return response
  },

  // ─── Help Chat ───
  async help(messages: unknown[], systemPrompt?: string) {
    const { data, error } = await supabase.functions.invoke("help-chat", {
      body: { messages, systemPrompt },
    })
    if (error) throw error
    return data
  },

  // ─── Database AI ───
  async generateQuery(query: string, schema: string = "") {
    const { data, error } = await supabase.functions.invoke("database-ai", {
      body: { query, schema },
    })
    if (error) throw error
    return data
  },

  // ─── Image Generation ───
  async generateImage(prompt: string, width = 512, height = 512) {
    const { data, error } = await supabase.functions.invoke("generate-image", {
      body: { prompt, width, height },
    })
    if (error) throw error
    return data
  },

  // ─── Niche Image Generation ───
  async generateNicheImage(payload: Record<string, unknown>) {
    const { data, error } = await supabase.functions.invoke("generate-niche-image", {
      body: payload,
    })
    if (error) throw error
    return data
  },
}
