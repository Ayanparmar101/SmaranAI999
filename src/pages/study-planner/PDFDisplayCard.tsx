import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription
} from '@/components/ui/card';
import { BookOpen, AlertTriangle } from 'lucide-react'; 
import LoadingState from '@/components/grammar/LoadingState';

interface PDFDisplayCardProps {
  pdfUrl?: string | null; 
  chapterContent?: string; // Can be used for status messages like "PDF not found"
  onReset?: () => void;
  isLoading?: boolean;
}

const PDFDisplayCard: React.FC<PDFDisplayCardProps> = ({ 
  pdfUrl,
  chapterContent, // This will now primarily be status messages from useChapterContent
  onReset,
  isLoading = false 
}) => {
  
  // Determine if there is a status message to display from chapterContent
  const statusMessage = chapterContent;
  const isErrorStatus = statusMessage?.includes("Error") || statusMessage?.includes("not found") || statusMessage?.includes("Failed");

  // Don't render the card at all if not loading and no PDF URL and no status message to show
  if (!isLoading && !pdfUrl && (!statusMessage || statusMessage === "Please select a chapter to view its PDF." || statusMessage === "PDF preview will appear here." || statusMessage === "PDF preview loaded successfully.")) {
    // Only render null if there's truly nothing to show (no URL, not loading, and no important status message)
    if (statusMessage === "PDF preview loaded successfully." && !pdfUrl) {
        // Edge case: message says success but no URL, treat as something to show (an issue)
    } else if (!pdfUrl && (statusMessage === "Please select a chapter to view its PDF." || statusMessage === "PDF preview will appear here." || statusMessage === "PDF preview loaded successfully.")){
        return null;
    }
    console.log('[PDFDisplayCard] No PDF URL, no significant status, and not loading. Rendering null.');
  }
  
  if (isLoading) {
    return (
      <Card className="w-full mt-6 print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary"/>PDF Viewer</CardTitle>
          <CardDescription>Loading PDF...</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingState />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mt-6 print:hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary"/>
            Chapter Preview
        </CardTitle>
        {!pdfUrl && !isLoading && statusMessage && (
          <CardDescription className={isErrorStatus ? 'text-red-600' : 'text-muted-foreground'}>
            {statusMessage} 
          </CardDescription>
        )}
        {pdfUrl && (
            <CardDescription>
                 The selected chapter PDF is displayed below. The study plan is generated based on chapter details, not its text.
            </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="w-full h-[600px] border rounded-md"
            title="PDF Preview"
          ></iframe>
        ) : (
          // This section is shown if still loading, or if PDF URL failed to load but there's a status message
          !isLoading && statusMessage && (
            <div className={`p-4 border border-dashed rounded-md text-center ${isErrorStatus ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50' }`}>
              {isErrorStatus && <AlertTriangle className="h-5 w-5 text-red-500 mx-auto mb-2" />}
              <p className={`${isErrorStatus ? 'text-red-700' : 'text-muted-foreground'}`}>{statusMessage}</p>
            </div>
          )
        )}
        {/* Removed the "Extracted Text (Preview)" section entirely */}
      </CardContent>
      {onReset && (
        <CardFooter>
          <Button onClick={onReset} variant="outline">Clear Selection</Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default PDFDisplayCard;
