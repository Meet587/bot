import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { supabase } from "./supabase";
import { StateGraph, END, START } from "@langchain/langgraph";
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";

// Define the state interface
interface AgentState {
    messages: BaseMessage[];
    context: string;
    userId: string;
    chatId: string;
}

// Initialize the OpenAI model
const model = new ChatOpenAI({
    model: "gpt-4o",
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
});

// Initialize OpenAI Embeddings
const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
    model: "text-embedding-3-small",
});

// Retrieve Node: Search Supabase using OpenAI Embeddings
async function retrieve(state: AgentState): Promise<Partial<AgentState>> {
    const messages = state.messages;
    const chatId = state.chatId;
    const lastMessage = messages[messages.length - 1] as HumanMessage;
    const query = lastMessage.content as string;

    // OpenAI generates the vector here
    const embedding = await embeddings.embedQuery(query);

    const { data: documents, error } = await supabase.rpc("match_documents", {
        query_embedding: embedding,
        match_threshold: 0.1,
        match_count: 5,
        filter_chat_id: chatId,
    });

    if (error) {
        console.error("Supabase match_documents error:", error);
        return { context: "" };
    }

    const context = documents?.map((doc: any) => doc.content).join("\n\n") || "";
    return { context };
}

// Generate Node: Use OpenAI to answer based on context
async function generate(state: AgentState): Promise<Partial<AgentState>> {
    const { messages, context } = state;

    const systemPrompt = `You are a helpful assistant. Use the following pieces of context to answer the user's question. 
  If you don't know the answer, just say that you don't know, don't try to make up an answer.
  ----------------
  ${context}`;

    const response = await model.invoke([["system", systemPrompt], ...messages]);

    return { messages: [response] }; // Reducer handles the concatenation
}

// Build the graph (Logic remains the same)
const workflow = new StateGraph<AgentState>({
    channels: {
        messages: {
            reducer: (a: BaseMessage[], b: BaseMessage[] | BaseMessage) => {
                if (Array.isArray(b)) return a.concat(b);
                return a.concat([b]);
            },
            default: () => [],
        },
        context: {
            reducer: (a: string, b: string) => b,
            default: () => "",
        },
        userId: {
            reducer: (a: string, b: string) => b,
            default: () => "",
        },
        chatId: {
            reducer: (a: string, b: string) => b,
            default: () => "",
        },
    },
})
    .addNode("retrieve", retrieve)
    .addNode("generate", generate)
    .addEdge(START, "retrieve")
    .addEdge("retrieve", "generate")
    .addEdge("generate", END);

export const graph = workflow.compile();
