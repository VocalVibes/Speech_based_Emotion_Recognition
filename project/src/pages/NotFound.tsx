import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] py-12">
      <h1 className="text-9xl font-extrabold text-primary/20">404</h1>
      <h2 className="text-2xl font-bold mt-6 mb-4">Page Not Found</h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button onClick={() => navigate('/')} className="gap-2 mb-8">
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>
    </div>
  );
};

export default NotFound;