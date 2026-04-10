'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isRecording?: boolean;
  onRecordingChange?: (isRecording: boolean) => void;
  size?: 'sm' | 'md' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
  variant?: 'ghost' | 'outline' | 'default';
}

// Check browser support for Speech Recognition
const SpeechRecognition =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

export function VoiceInput({
  onTranscript,
  isRecording: externalIsRecording,
  onRecordingChange,
  size = 'sm',
  className,
  disabled = false,
  variant = 'ghost',
}: VoiceInputProps) {
  const [internalRecording, setInternalRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const isRecording = externalIsRecording ?? internalRecording;
  const setIsRecording = onRecordingChange ?? setInternalRecording;

  useEffect(() => {
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!SpeechRecognition) return;

    setError(null);
    setInterimTranscript('');

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscriptText = '';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptText += transcript + ' ';
          onTranscript(transcript);
        } else {
          interim += transcript;
        }
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      const err = event.error as string;
      if (err === 'not-allowed') {
        toast.error('Microphone access denied', { description: 'Please allow microphone permissions in your browser settings and try again.' });
      } else if (err === 'no-speech') {
        toast.warning('No speech detected', { description: 'Try speaking louder or closer to the microphone.' });
      } else if (err === 'aborted') {
        // User-initiated stop — silently ignore
      } else {
        toast.error('Voice input error', { description: `Could not process speech: ${err}` });
      }
      setError(err);
      // Auto-clear error after 3s so user can retry
      setTimeout(() => setError(null), 3000);
      setIsRecording(false);
      setInterimTranscript('');
    };

    recognition.onend = () => {
      // Auto-restart if still recording (recognition can stop after silence)
      if (recognitionRef.current && internalRecording) {
        try {
          recognition.start();
        } catch {
          setIsRecording(false);
        }
      } else {
        setIsRecording(false);
        setInterimTranscript('');
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setInternalRecording(true);
    } catch (err) {
      setError('Failed to start voice input');
    }
  }, [onTranscript, setIsRecording, internalRecording]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // Prevent auto-restart
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setInternalRecording(false);
    setIsRecording(false);
    setInterimTranscript('');
  }, [setIsRecording]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, []);

  const sizeClasses = {
    sm: 'h-7 px-2 text-xs gap-1',
    md: 'h-8 px-3 text-sm gap-1.5',
    lg: 'h-10 px-4 text-sm gap-2',
    icon: 'h-7 w-7 p-0',
  };

  if (!isSupported) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative inline-flex items-center">
            <Button
              variant={variant}
              size="sm"
              className={cn(
                sizeClasses[size],
                'relative overflow-hidden transition-all duration-300',
                isRecording && 'bg-red-500/15 text-red-500 hover:bg-red-500/20 hover:text-red-500 border-red-500/30',
                !isRecording && 'text-muted-foreground hover:text-foreground',
                className
              )}
              onClick={toggleRecording}
              disabled={disabled}
            >
              {isRecording ? (
                <>
                  {/* Pulsing recording indicator */}
                  <span className="absolute inset-0 rounded-[inherit] animate-pulse bg-red-500/20" />
                  <MicOff className="w-3.5 h-3.5 relative z-10" />
                  {size !== 'icon' && <span className="relative z-10">Stop</span>}
                  {/* Recording dot */}
                  <span className="relative z-10 flex items-center gap-1 ml-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  </span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5" />
                  {size !== 'icon' && <span>Voice</span>}
                </>
              )}
            </Button>

            {/* Interim transcript tooltip */}
            {isRecording && interimTranscript && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-popover border border-border shadow-lg text-xs text-popover-foreground max-w-[200px] truncate z-50 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <Volume2 className="w-3 h-3 text-red-400 animate-pulse" />
                  <span className="italic opacity-70">{interimTranscript}</span>
                </div>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {error ? error : isRecording ? 'Listening... click to stop' : 'Start voice typing'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
