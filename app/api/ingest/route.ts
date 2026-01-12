import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to blob
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer]);

    // Parse PDF
    const loader = new WebPDFLoader(blob);
    const docs = await loader.load();

    // Split text into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    // splitDocuments takes Document[]
    const output = await splitter.splitDocuments(docs);

    // Use OpenAI for embeddings
    const embeddings = new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY,
      model: "text-embedding-3-small",
    });

    // Process chunks and store in Supabase
    const documents = await Promise.all(
      output.map(async (doc) => {
        const embedding = await embeddings.embedQuery(doc.pageContent);
        return {
          content: doc.pageContent,
          embedding,
          metadata: { ...doc.metadata, filename: file.name },
        };
      })
    );

    // Upsert to Supabase
    const { error } = await supabase.from("documents").insert(documents);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to save documents" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, count: documents.length });
  } catch (error) {
    console.error("Ingest error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
