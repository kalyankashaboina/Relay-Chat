import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Mic, Square, Send, X, Trash2 } from 'lucide-react';

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob) => void;
  onCancel: () => void;
  translate: (key: string) => string;
}

export function VoiceRecorder({ onSend, onCancel, translate }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch (error) {
      console.error('Microphone access denied:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob);
      resetRecorder();
    }
  };

  const resetRecorder = () => {
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setDuration(0);
    onCancel();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (audioBlob && audioUrl) {
    return (
      <div className="flex items-center gap-3 bg-secondary rounded-2xl p-3 animate-in slide-in-from-bottom-2">
        <button
          onClick={resetRecorder}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
        >
          <Trash2 className="h-5 w-5" />
        </button>

        <div className="flex-1">
          <audio src={audioUrl} controls className="w-full h-8" />
        </div>

        <span className="text-sm font-medium text-muted-foreground min-w-[40px]">
          {formatDuration(duration)}
        </span>

        <button
          onClick={handleSend}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-secondary rounded-2xl p-3 animate-in slide-in-from-bottom-2">
      <button
        onClick={onCancel}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted-foreground/20 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex-1 flex items-center gap-3">
        {isRecording && (
          <>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
              <span className="text-sm font-medium text-destructive">Recording</span>
            </div>
            <div className="flex-1 flex items-center gap-1">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-primary rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 20 + 8}px`,
                    animationDelay: `${i * 50}ms`,
                  }}
                />
              ))}
            </div>
          </>
        )}
        <span className="text-sm font-medium text-muted-foreground min-w-[40px]">
          {formatDuration(duration)}
        </span>
      </div>

      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full transition-all shadow-lg',
          isRecording
            ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            : 'bg-primary text-primary-foreground hover:bg-primary/90',
        )}
      >
        {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </button>
    </div>
  );
}
