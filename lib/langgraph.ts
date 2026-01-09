
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { supabase } from "./supabase";
import { StateGraph, END, START } from "@langchain/langgraph";
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";

// Define the state interface
interface AgentState {
    messages: BaseMessage[];
    context: string;
}

// Initialize the model
const model = new ChatGoogleGenerativeAI({
    model: "gemini-pro",
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0,
});

const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    modelName: "embedding-001",
});

// Retrieve Node: Search Supabase for relevant content
async function retrieve(state: AgentState): Promise<Partial<AgentState>> {
    const messages = state.messages;
    const lastMessage = messages[messages.length - 1] as HumanMessage;
    const query = lastMessage.content as string;

    const embedding = await embeddings.embedQuery(query);

    const { data: documents, error } = await supabase.rpc('match_documents', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 5,
    });

    if (error) {
        console.error("Supabase match_documents error:", error);
        return { context: "" };
    }

    const context = documents?.map((doc: any) => doc.content).join("\n\n") || "";
    return { context };
}

// Generate Node: Use Gemini to answer based on context
async function generate(state: AgentState): Promise<Partial<AgentState>> {
    const { messages, context } = state;
    // const lastMessage = messages[messages.length - 1]; // Unused

    const systemPrompt = `You are a helpful assistant. Use the following pieces of context to answer the user's question. 
  If you don't know the answer, just say that you don't know, don't try to make up an answer.
  ----------------
  ${context}`;

    const response = await model.invoke([
        ["system", systemPrompt],
        ...messages
    ]);

    return { messages: [...messages, response] };
}

// Build the graph
const workflow = new StateGraph<AgentState>({
    channels: {
        messages: {
            reducer: (a: BaseMessage[], b: BaseMessage[] | BaseMessage) => {
                if (Array.isArray(b)) {
                    return a.concat(b);
                }
                return a.concat([b]);
            },
            default: () => [],
        },
        context: {
            reducer: (a: string, b: string) => b,
            default: () => "",
        }
    }
});

workflow.addNode("retrieve", retrieve);
workflow.addNode("generate", generate);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
workflow.setEntryPoint("retrieve" as any);
workflow.addEdge("retrieve" as any, "generate" as any);
workflow.addEdge("generate" as any, END);

export const graph = workflow.compile();
