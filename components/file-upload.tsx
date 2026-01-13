
"use client";

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function FileUpload({ onUploadComplete, chatId }: { onUploadComplete: () => void; chatId: string | null }) {
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
        if (!chatId) {
            setStatus('error');
            setMessage('Please select a chat first.');
            return;
        }

        setUploading(true);
        setStatus('idle');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('chatId', chatId);

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
        <Card className="w-full max-w-md mx-auto shadow-md border-border">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-card-foreground">Upload PDF</CardTitle>
                <CardDescription>Upload a document to chat with it.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-input rounded-lg p-8 flex flex-col items-center justify-center space-y-3 hover:border-primary transition-colors cursor-pointer relative">
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={!chatId}
                    />
                    {file ? (
                        <FileText className="w-12 h-12 text-primary" />
                    ) : (
                        <Upload className={`w-12 h-12 ${chatId ? 'text-muted-foreground' : 'text-muted-foreground/50'}`} />
                    )}
                    <span className={`text-muted-foreground font-medium ${!chatId && 'opacity-50'}`}>
                        {file ? file.name : chatId ? 'Click to select or drag PDF' : 'Select a chat first'}
                    </span>
                </div>

                {status === 'error' && (
                    <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
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

                <Button
                    onClick={handleUpload}
                    disabled={!file || uploading || !chatId}
                    className="w-full font-bold"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Indexing...
                        </>
                    ) : (
                        'Upload & Index'
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
