import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ModelStatus } from '@/types';

const ModelStatusCard = () => {
  const { toast } = useToast();
  const [modelStatus, setModelStatus] = useState<ModelStatus>({
    status: 'checking',
    description: 'Checking connection to the speech emotion analysis model...'
  });
  
  // Simulate checking model status on component mount
  useEffect(() => {
    const checkModelStatus = async () => {
      setModelStatus({
        status: 'checking',
        description: 'Checking connection to the speech emotion analysis model...'
      });
      
      // Simulate API call with delay
      setTimeout(() => {
        setModelStatus({
          status: 'ready',
          description: 'The speech emotion analysis model is ready to use.'
        });
      }, 1500);
    };
    
    checkModelStatus();
  }, []);
  
  const handleRefreshStatus = () => {
    setModelStatus({
      status: 'checking',
      description: 'Re-checking connection to the speech emotion analysis model...'
    });
    
    // Simulate API call with delay
    setTimeout(() => {
      const newStatus: ModelStatus = Math.random() > 0.2 ? {
        status: 'ready',
        description: 'The speech emotion analysis model is ready to use.'
      } : {
        status: 'error',
        description: 'Unable to connect to the speech emotion analysis model. Please try again.'
      };
      
      setModelStatus(newStatus);
      
      if (newStatus.status === 'error') {
        toast({
          title: 'Model Connection Error',
          description: 'There was an issue connecting to the analysis model.',
          variant: 'destructive',
        });
      }
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Status</CardTitle>
        <CardDescription>
          Speech emotion analysis model connection status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4">
            {modelStatus.status === 'ready' && (
              <CheckCircle className="h-10 w-10 text-green-500" />
            )}
            {modelStatus.status === 'error' && (
              <XCircle className="h-10 w-10 text-red-500" />
            )}
            {modelStatus.status === 'checking' && (
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            )}
          </div>
          
          <div>
            <div className="font-medium capitalize">{modelStatus.status}</div>
            <div className="text-sm text-muted-foreground">
              {modelStatus.description}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={handleRefreshStatus}
          disabled={modelStatus.status === 'checking'}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${
            modelStatus.status === 'checking' ? 'animate-spin' : ''
          }`} />
          {modelStatus.status === 'checking' ? 'Checking...' : 'Refresh Status'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ModelStatusCard;