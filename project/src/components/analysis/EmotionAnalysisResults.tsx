import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Download,
  Save,
  Share2,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EmotionAnalysis } from '@/services/emotionService';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface EmotionAnalysisResultsProps {
  patientName: string;
  analysis: EmotionAnalysis;
  onDownload?: () => Promise<void>;
  onSave?: () => Promise<void>;
  onShare?: () => Promise<void>;
  onViewHistory?: () => void;
  isLoading?: boolean;
}

const EmotionAnalysisResults: React.FC<EmotionAnalysisResultsProps> = ({ 
  patientName, 
  analysis,
  onDownload,
  onSave,
  onShare,
  onViewHistory,
  isLoading = false
}) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Function to get appropriate color for each emotion
  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'happy': return 'bg-green-500';
      case 'sad': return 'bg-blue-500';
      case 'angry': return 'bg-red-500';
      case 'neutral': return 'bg-gray-500';
      case 'calm': return 'bg-teal-500';
      case 'fearful': return 'bg-yellow-500';
      case 'disgust': return 'bg-purple-500';
      case 'surprised': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  // Sort emotions by score for display
  const sortedEmotions = Object.entries(analysis?.emotionScores || {})
    .sort((a, b) => b[1] - a[1]);

  // Handle download
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      if (onDownload) {
        await onDownload();
      } else {
        const report = generateReport();
        downloadReport(report);
      }
      toast({
        title: 'Download successful',
        description: 'The analysis report has been downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Failed to download the report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle save
  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (onSave) {
        await onSave();
        toast({
          title: 'Save successful',
          description: 'The analysis has been saved to records.',
        });
      }
    } catch (error) {
      toast({
        title: 'Save failed',
        description: 'Failed to save the analysis. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle share
  const handleShare = async () => {
    try {
      setIsSharing(true);
      if (onShare) {
        await onShare();
        toast({
          title: 'Share successful',
          description: 'The analysis has been shared.',
        });
      }
    } catch (error) {
      toast({
        title: 'Share failed',
        description: 'Failed to share the analysis. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSharing(false);
    }
  };

  // Generate report content
  const generateReport = () => {
    if (!analysis) return '';

    let report = `Patient Name: ${patientName}\n`;
    report += `Analysis Date: ${new Date().toLocaleDateString()}\n\n`;
    report += `Primary Emotion: ${analysis.primaryEmotion || 'Unknown'}\n`;
    report += `Confidence Score: ${Math.round((analysis.confidenceScore || 0) * 100)}%\n\n`;
    
    if (analysis.strengths?.length) {
      report += `Strong Points:\n`;
      analysis.strengths.forEach((strength, index) => {
        report += `${index + 1}. ${strength}\n`;
      });
    }
    
    if (analysis.weaknesses?.length) {
      report += `\nAreas for Improvement:\n`;
      analysis.weaknesses.forEach((weakness, index) => {
        report += `${index + 1}. ${weakness}\n`;
      });
    }
    
    if (sortedEmotions.length) {
      report += `\nEmotion Distribution:\n`;
      sortedEmotions.forEach(([emotion, score]) => {
        report += `${emotion}: ${Math.round(score * 100)}%\n`;
      });
    }
    
    return report;
  };

  // Download report as text file
  const downloadReport = (content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${patientName || 'patient'}-emotion-analysis-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Analyzing speech...</span>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No analysis results available.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Speech Emotion Analysis Results</CardTitle>
        <CardDescription>
          Analysis results for patient: {patientName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Emotion Section */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium">Primary Detected Emotion</h3>
              <p className="text-sm text-muted-foreground">
                The dominant emotion detected in the speech sample
              </p>
            </div>
            <Badge className="text-lg py-1 px-3 capitalize">
              {analysis.primaryEmotion || 'Unknown'}
            </Badge>
          </div>
          <div className="flex items-center">
            <div className="text-sm text-muted-foreground">Confidence Score:</div>
            <div className="ml-2 flex items-center">
              <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${(analysis.confidenceScore || 0) * 100}%` }} 
                />
              </div>
              <span className="ml-2 text-sm font-medium">
                {Math.round((analysis.confidenceScore || 0) * 100)}%
              </span>
            </div>
          </div>
        </div>
        
        {/* Strong Points Section */}
        {analysis.strengths && analysis.strengths.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-green-700 dark:text-green-300 mb-2">Strong Points</h3>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-green-700 dark:text-green-300">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas for Improvement Section */}
        {analysis.weaknesses && analysis.weaknesses.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-amber-700 dark:text-amber-300 mb-2">Areas for Improvement</h3>
            <ul className="space-y-2">
              {analysis.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                  <span className="text-amber-700 dark:text-amber-300">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Emotion Distribution Section */}
        {sortedEmotions.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">Emotion Distribution</h3>
          <div className="space-y-3">
            {sortedEmotions.map(([emotion, score]) => (
              <div key={emotion} className="flex items-center">
                <div className="w-24 text-sm capitalize">{emotion}</div>
                <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden mr-3">
                  <div 
                    className={`h-full ${getEmotionColor(emotion)}`} 
                    style={{ width: `${score * 100}%` }} 
                  />
                </div>
                <div className="w-10 text-sm font-medium text-right">
                  {Math.round(score * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap justify-between gap-2">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
            <Download className="mr-2 h-4 w-4" />
            )}
            Download Report
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
            <Save className="mr-2 h-4 w-4" />
            )}
            Save to Records
          </Button>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleShare}
            disabled={isSharing}
          >
            {isSharing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
            <Share2 className="mr-2 h-4 w-4" />
            )}
            Share Results
          </Button>
          <Button 
            size="sm" 
            onClick={onViewHistory}
          >
            View Past Analyses
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EmotionAnalysisResults;