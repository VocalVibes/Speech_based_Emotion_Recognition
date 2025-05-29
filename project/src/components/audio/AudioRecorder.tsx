import { useState, useRef, useEffect } from 'react';
import { Mic, StopCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onFileUpload: (file: File) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, onFileUpload }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size < 2000) {
          toast({
            title: 'Recording too short or silent',
            description: 'Please record at least 1 second of audible speech.',
            variant: 'destructive',
          });
          return;
        }
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        onRecordingComplete(audioBlob);
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      toast({
        title: 'Recording started',
        description: 'Speak clearly into your microphone',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to access microphone. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      toast({
        title: 'Recording stopped',
        description: 'Audio recording completed',
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('audio/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an audio file',
        variant: 'destructive',
      });
      return;
    }

    onFileUpload(file);
    toast({
      title: 'File uploaded',
      description: `${file.name} is ready for analysis`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          variant={isRecording ? 'destructive' : 'default'}
          className="w-full"
        >
          {isRecording ? (
            <>
              <StopCircle className="mr-2 h-4 w-4" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="mr-2 h-4 w-4" />
              Start Recording
            </>
          )}
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => document.getElementById('audio-upload')?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Audio
        </Button>
        <input
          id="audio-upload"
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {audioURL && (
        <div className="mt-4">
          <audio src={audioURL} controls className="w-full" />
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;