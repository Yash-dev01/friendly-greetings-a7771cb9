// @ts-nocheck
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const jwt = authHeader.replace("Bearer ", "");
    const { data: user, error: userError } = await supabase.auth.getUser(jwt);

    if (userError || !user.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.user.id;

    if (req.method === "GET" && path === "conversations") {
      const { data, error } = await supabase
        .from("conversations")
        .select(
          `
          id,
          participants,
          last_message,
          last_message_time,
          created_at,
          updated_at
        `
        )
        .filter("participants", "cs", `{${userId}}`)
        .order("last_message_time", { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST" && path === "conversations") {
      const { otherUserId } = await req.json();

      const { data: existingConv, error: searchError } = await supabase
        .from("conversations")
        .select("id")
        .filter("participants", "cs", `{${userId}}`)
        .filter("participants", "cs", `{${otherUserId}}`)
        .maybeSingle();

      if (searchError) throw searchError;

      if (existingConv) {
        return new Response(JSON.stringify(existingConv), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: newConv, error: createError } = await supabase
        .from("conversations")
        .insert([{ participants: [userId, otherUserId] }])
        .select()
        .single();

      if (createError) throw createError;

      await supabase.from("read_receipts").insert([
        { conversation_id: newConv.id, user_id: userId, unread_count: 0 },
        { conversation_id: newConv.id, user_id: otherUserId, unread_count: 0 },
      ]);

      return new Response(JSON.stringify(newConv), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "GET" && path?.startsWith("messages-")) {
      const conversationId = path.replace("messages-", "");

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST" && path?.startsWith("messages-")) {
      const conversationId = path.replace("messages-", "");
      const { content } = await req.json();

      const { data: message, error: insertError } = await supabase
        .from("messages")
        .insert([
          {
            conversation_id: conversationId,
            sender_id: userId,
            content,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      const { data: conversation } = await supabase
        .from("conversations")
        .select("participants")
        .eq("id", conversationId)
        .single();

      if (conversation) {
        const otherParticipants = conversation.participants.filter((p: string) => p !== userId);

        await supabase
          .from("conversations")
          .update({
            last_message: content.substring(0, 100),
            last_message_time: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", conversationId);

        for (const participantId of otherParticipants) {
          const { data: receipt } = await supabase
            .from("read_receipts")
            .select("*")
            .eq("conversation_id", conversationId)
            .eq("user_id", participantId)
            .maybeSingle();

          if (receipt) {
            await supabase
              .from("read_receipts")
              .update({ unread_count: (receipt.unread_count || 0) + 1 })
              .eq("id", receipt.id);
          } else {
            await supabase
              .from("read_receipts")
              .insert([{ conversation_id: conversationId, user_id: participantId, unread_count: 1 }]);
          }
        }
      }

      return new Response(JSON.stringify(message), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "PUT" && path?.startsWith("read-")) {
      const conversationId = path.replace("read-", "");

      const { data: receipt } = await supabase
        .from("read_receipts")
        .select("*")
        .eq("conversation_id", conversationId)
        .eq("user_id", userId)
        .maybeSingle();

      if (receipt) {
        await supabase
          .from("read_receipts")
          .update({ unread_count: 0, updated_at: new Date().toISOString() })
          .eq("id", receipt.id);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
