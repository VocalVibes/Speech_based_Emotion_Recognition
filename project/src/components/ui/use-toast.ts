import { toast as sonnerToast } from 'sonner';

// Simple custom toast implementation using browser alerts (replace with your own UI as needed)
export function useToast() {
  const toast = ({ title, description, variant }: { title: string; description?: string; variant?: 'destructive' | 'success' | 'info' }) => {
    if (variant === 'destructive') {
      sonnerToast.error(title, { description });
    } else if (variant === 'success') {
      sonnerToast.success(title, { description });
    } else {
      sonnerToast(title, { description });
    }
  };

  return { toast };
} 