
import { NextRequest, NextResponse } from 'next/server';
import { graph } from '@/lib/langgraph';
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { messages } = body;

        // Convert JSON messages to LangChain Message objects
        const langChainMessages: BaseMessage[] = messages.map((m: any) => {
            if (m.role === 'user') {
                return new HumanMessage(m.content);
            } else {
                return new AIMessage(m.content);
            }
        });

        const inputs = { messages: langChainMessages };

        // We can use invoke to get the final state
        const result = await graph.invoke(inputs);

        // The result state will have the updated messages. 
        // The last message is the bot's response.
        const outputMessages = result.messages as BaseMessage[];
        const lastMessage = outputMessages[outputMessages.length - 1];

        return NextResponse.json({
            role: 'assistant',
            content: lastMessage.content
        });

    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
