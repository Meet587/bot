import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { graph } from "@/lib/langgraph";
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        const { chatId } = await params;
        const body = await req.json();
        const { content } = body;

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!content) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        // Verify chat ownership
        const { data: chat, error: chatError } = await supabase
            .from("chats")
            .select("id")
            .eq("id", chatId)
            .eq("user_id", user.id)
            .single();

        if (chatError || !chat) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        }

        // Save user message
        const { error: msgError } = await supabase
            .from("messages")
            .insert({
                chat_id: chatId,
                role: "user",
                content,
            });

        if (msgError) {
            console.error("Error saving message:", msgError);
            return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
        }

        // Fetch previous messages for context (optional, but good for conversation history)
        // For now, let's just pass the current history if needed, or rely on LangChain state if we were persisting state there.
        // Since we are stateless in the graph per request (REST API), we should probably fetch history.
        // Ideally, we fetch last N messages from DB.
        const { data: history } = await supabase
            .from("messages")
            .select("role, content")
            .eq("chat_id", chatId)
            .order("created_at", { ascending: true })
            .limit(10); // Context window

        const langChainMessages: BaseMessage[] = (history || []).map((m: any) => {
            if (m.role === "user") {
                return new HumanMessage(m.content);
            } else {
                return new AIMessage(m.content);
            }
        });

        // Run LangGraph
        const inputs = {
            messages: langChainMessages,
            userId: user.id,
            chatId: chatId,
        };

        const result = await graph.invoke(inputs);
        const outputMessages = result.messages as BaseMessage[];
        const lastMessage = outputMessages[outputMessages.length - 1];

        // Save assistant message
        const { error: replyError } = await supabase
            .from("messages")
            .insert({
                chat_id: chatId,
                role: "assistant",
                content: lastMessage.content as string,
            });

        if (replyError) {
            console.error("Error saving reply:", replyError);
        }

        return NextResponse.json({
            role: "assistant",
            content: lastMessage.content,
        });
    } catch (error) {
        console.error("Chat error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
