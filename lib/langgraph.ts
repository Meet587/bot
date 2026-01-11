import { ChatGroq } from "@langchain/groq";
import { JinaEmbeddings } from "@langchain/community/embeddings/jina";
import { supabase } from "./supabase";
import { StateGraph, END, START } from "@langchain/langgraph";
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";

// Define the state interface
interface AgentState {
  messages: BaseMessage[];
  context: string;
}

// Initialize the model (Gemini remains for generation)
const model = new ChatGroq({
  model: "llama-3.1-70b-versatile",
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0,
});

// Initialize Jina AI Embeddings
const embeddings = new JinaEmbeddings({
  apiKey: process.env.JINA_API_KEY, // Ensure this is in your .env
  model: "jina-embeddings-v2-base-en", // Or "jina-embeddings-v3"
});

// Retrieve Node: Search Supabase using Jina Embeddings
async function retrieve(state: AgentState): Promise<Partial<AgentState>> {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as HumanMessage;
  const query = lastMessage.content as string;

  // Jina generates the vector here
  const embedding = await embeddings.embedQuery(query);

  const { data: documents, error } = await supabase.rpc("match_documents", {
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
  },
})
  .addNode("retrieve", retrieve)
  .addNode("generate", generate)
  .addEdge(START, "retrieve")
  .addEdge("retrieve", "generate")
  .addEdge("generate", END);

export const graph = workflow.compile();
