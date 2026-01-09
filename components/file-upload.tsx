
'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function FileUpload({ onUploadComplete }: { onUploadComplete: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setMessage('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setStatus('idle');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/ingest', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setStatus('success');
            setMessage(`Successfully indexed ${data.count} chunks.`);
            onUploadComplete();
        } catch (error: any) {
            console.error(error);
            setStatus('error');
            setMessage(error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-md space-y-4 border border-gray-100">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">Upload PDF</h2>
                <p className="text-gray-500 text-sm">Upload a document to chat with it.</p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center space-y-3 hover:border-blue-500 transition-colors cursor-pointer relative">
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {file ? (
                    <FileText className="w-12 h-12 text-blue-500" />
                ) : (
                    <Upload className="w-12 h-12 text-gray-400" />
                )}
                <span className="text-gray-600 font-medium">
                    {file ? file.name : 'Click to select or drag PDF'}
                </span>
            </div>

            {status === 'error' && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span>{message}</span>
                </div>
            )}

            {status === 'success' && (
                <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                    <span>{message}</span>
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {uploading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Indexing...
                    </>
                ) : (
                    'Upload & Index'
                )}
            </button>
        </div>
    );
}
