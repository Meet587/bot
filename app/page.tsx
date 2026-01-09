
'use client';

import { useState } from 'react';
import FileUpload from '@/components/file-upload';
import ChatInterface from '@/components/chat-interface';
import { MessageSquare, UploadCloud } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'upload' | 'chat'>('upload');

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-xl text-gray-900 tracking-tight">PDF ChatBot</h1>
          </div>
          <nav className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'upload'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <span className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4" />
                Upload
              </span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'chat'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat
              </span>
            </button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'upload' ? (
            <div className="flex flex-col items-center justify-center h-[600px]">
              <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Start by uploading a PDF</h2>
                  <p className="text-gray-600">
                    Upload your documents to our secure vector store. Once indexed, switch to the chat tab to ask questions.
                  </p>
                </div>
                <FileUpload onUploadComplete={() => setActiveTab('chat')} />
              </div>
            </div>
          ) : (
            <div className="h-full">
              <ChatInterface />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
