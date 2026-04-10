'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Upload,
  X,
  Image as ImageIcon,
  FileText,
  Link2,
  Video,
  File,
  ExternalLink,
  Check,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================================
// Image Uploader Editor
// ============================================================

interface ImageUploaderProps {
  value: string; // base64 or URL
  onChange: (value: string) => void;
}

export function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) return; // 10MB limit

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
      setPreviewError(false);
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleUrlSubmit = useCallback(() => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setPreviewError(false);
    }
  }, [urlInput, onChange]);

  const handleRemove = useCallback(() => {
    onChange('');
    setUrlInput('');
    setPreviewError(false);
  }, [onChange]);

  return (
    <div className="space-y-3">
      {/* Preview or Upload Zone */}
      {value ? (
        <div className="relative group rounded-lg overflow-hidden border bg-muted/20">
          {!previewError ? (
            <img
              src={value}
              alt="Uploaded"
              className="w-full max-h-[320px] object-contain bg-black/5"
              onError={() => setPreviewError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ImageIcon className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">Unable to preview</p>
              <p className="text-xs mt-1">Content saved but cannot be displayed</p>
            </div>
          )}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button
              variant="secondary"
              size="sm"
              className="h-7 text-xs shadow-sm bg-background/90 backdrop-blur-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Replace
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="h-7 w-7 shadow-sm"
              onClick={handleRemove}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            'flex flex-col items-center justify-center py-10 rounded-lg border-2 border-dashed transition-colors cursor-pointer',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors',
            isDragging ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          )}>
            <Upload className={cn('w-5 h-5', isDragging && 'animate-bounce')} />
          </div>
          <p className="text-sm font-medium">
            {isDragging ? 'Drop image here' : 'Click to upload or drag & drop'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG, GIF, WEBP up to 10MB
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />

      {/* URL input fallback */}
      {!value && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div className="relative">
                <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Or paste an image URL..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="pl-8 h-9 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                />
              </div>
            </div>
            <Button
              size="sm"
              className="h-9"
              disabled={!urlInput.trim()}
              onClick={handleUrlSubmit}
            >
              Add
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Document Uploader Editor
// ============================================================

interface DocumentUploaderProps {
  value: string; // base64 data or file info
  onChange: (value: string) => void;
}

export function DocumentUploader({ value, onChange }: DocumentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [fileType, setFileType] = useState('');

  // Try to parse existing value
  const isExisting = !!value;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileSelect = useCallback((file: File) => {
    if (file.size > 50 * 1024 * 1024) return; // 50MB limit

    setFileName(file.name);
    setFileSize(formatFileSize(file.size));
    setFileType(file.type || 'application/octet-stream');

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Store as JSON with metadata
      const docData = JSON.stringify({
        name: file.name,
        size: file.size,
        type: file.type,
        data: result,
      });
      onChange(docData);
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleRemove = useCallback(() => {
    onChange('');
    setFileName('');
    setFileSize('');
    setFileType('');
  }, [onChange]);

  const getFileIcon = () => {
    if (fileType.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    if (fileType.includes('word') || fileType.includes('doc')) return <FileText className="w-8 h-8 text-blue-500" />;
    if (fileType.includes('sheet') || fileType.includes('excel') || fileType.includes('xls')) return <FileText className="w-8 h-8 text-emerald-500" />;
    return <File className="w-8 h-8 text-muted-foreground" />;
  };

  return (
    <div className="space-y-3">
      {isExisting || fileName ? (
        <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/20">
          <div className="w-14 h-14 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
            {getFileIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{fileName || 'Uploaded document'}</p>
            {fileSize && (
              <p className="text-xs text-muted-foreground">{fileSize}</p>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => fileInputRef.current?.click()}
            >
              Replace
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={handleRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            'flex flex-col items-center justify-center py-10 rounded-lg border-2 border-dashed transition-colors cursor-pointer',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors',
            isDragging ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          )}>
            <Upload className={cn('w-5 h-5', isDragging && 'animate-bounce')} />
          </div>
          <p className="text-sm font-medium">
            {isDragging ? 'Drop document here' : 'Click to upload or drag & drop'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PDF, DOCX, TXT, XLS up to 50MB
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv,.ppt,.pptx,.md"
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  );
}

// ============================================================
// Video URL Editor
// ============================================================

interface VideoURLEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function VideoURLEditor({ value, onChange }: VideoURLEditorProps) {
  const [url, setUrl] = useState(() => value);
  const [embedUrl, setEmbedUrl] = useState('');
  const [title, setTitle] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [description, setDescription] = useState('');

  // Extract YouTube/Vimeo embed URL
  const getEmbedUrl = useCallback((input: string) => {
    let embedUrl = '';

    // YouTube: various formats
    const ytMatch = input.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) {
      embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    }

    // Vimeo
    const vimeoMatch = input.match(/vimeo\.com\/(?:\d+|video\/\d+)/);
    if (vimeoMatch && !embedUrl) {
      embedUrl = input.replace('vimeo.com/', 'player.vimeo.com/video/');
    }

    return embedUrl;
  }, []);

  const handleValidate = useCallback(() => {
    if (!url.trim()) {
      setIsValid(false);
      setEmbedUrl('');
      return;
    }

    const hasUrlPattern = /^https?:\/\/.+/i.test(url.trim());
    if (!hasUrlPattern) {
      setIsValid(false);
      setEmbedUrl('');
      return;
    }

    const embed = getEmbedUrl(url.trim());
    setEmbedUrl(embed);
    setIsValid(true);
    onChange(url.trim());
  }, [url, getEmbedUrl, onChange]);

  // Initialize from existing value
  useState(() => {
    if (value) {
      const embed = getEmbedUrl(value);
      if (embed) setEmbedUrl(embed);
    }
  });

  return (
    <div className="space-y-3">
      {/* URL Input */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Video URL</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Video className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setIsValid(false);
              }}
              placeholder="https://www.youtube.com/watch?v=..."
              className="pl-9 h-10 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
            />
          </div>
          <Button
            onClick={handleValidate}
            disabled={!url.trim()}
            className="h-10 px-4"
          >
            {isValid ? <Check className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Supports YouTube, Vimeo, and direct video links
        </p>
      </div>

      {/* Video Preview */}
      {isValid && embedUrl ? (
        <div className="rounded-lg overflow-hidden border bg-black">
          <iframe
            src={embedUrl}
            className="w-full aspect-video"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title="Video preview"
          />
        </div>
      ) : isValid && url ? (
        <div className="rounded-lg border bg-muted/20 p-6 flex flex-col items-center text-center">
          <Video className="w-10 h-10 text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">Video link saved</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            Open video
          </a>
        </div>
      ) : null}

      {/* Notes about this video */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Notes</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add notes about this video..."
          className="min-h-[100px] text-sm"
        />
      </div>
    </div>
  );
}

// ============================================================
// External Link Editor
// ============================================================

interface LinkURLEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function LinkURLEditor({ value, onChange }: LinkURLEditorProps) {
  const [url, setUrl] = useState(() => value);
  const [linkTitle, setLinkTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isValid, setIsValid] = useState(false);

  const handleValidate = useCallback(() => {
    if (!url.trim()) {
      setIsValid(false);
      return;
    }
    const hasUrlPattern = /^https?:\/\/.+/i.test(url.trim());
    setIsValid(hasUrlPattern);
    if (hasUrlPattern) {
      onChange(url.trim());
    }
  }, [url, onChange]);

  // Initialize from existing value
  useState(() => {
    if (value) {
      const hasUrlPattern = /^https?:\/\/.+/i.test(value);
      setIsValid(hasUrlPattern);
    }
  });

  return (
    <div className="space-y-3">
      {/* URL Input */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">URL</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setIsValid(false);
              }}
              placeholder="https://example.com/article"
              className="pl-9 h-10 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
            />
          </div>
          <Button
            onClick={handleValidate}
            disabled={!url.trim()}
            className="h-10 px-4"
          >
            {isValid ? <Check className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Link Preview Card */}
      {isValid ? (
        <a
          href={url.trim()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 p-4 rounded-lg border bg-muted/20 hover:bg-muted/30 transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
            <ExternalLink className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-primary group-hover:underline">
              {url.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              Click to open in new tab
            </p>
          </div>
        </a>
      ) : null}

      {/* Description */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add notes or a description for this link..."
          className="min-h-[100px] text-sm"
        />
      </div>
    </div>
  );
}
