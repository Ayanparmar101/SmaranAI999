import React, { memo, useMemo, Suspense, lazy, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Maximize2, Settings } from 'lucide-react';

interface ChapterContentEnhancedProps {
  chapterContent: string;
  pdfUrl: string | null;
}

// Lazy load PDF viewer for better performance
const PDFViewer = lazy(() => import('@/components/PDFViewer'));
const SecurePDFViewer = lazy(() => import('@/components/SecurePDFViewer'));

const ChapterContentEnhanced: React.FC<ChapterContentEnhancedProps> = memo(({ chapterContent, pdfUrl }) => {
  const [viewerType, setViewerType] = useState<'secure' | 'advanced' | 'simple'>('secure');

  // Memoize content rendering to prevent unnecessary re-renders
  const contentDisplay = useMemo(() => {
    if (chapterContent && chapterContent.trim()) {
      return (
        <div className="prose max-w-none p-4 whitespace-pre-wrap">
          {chapterContent}
        </div>
      );
    }
    return (
      <div className="text-center text-muted-foreground p-4">
        <p>Select a chapter to load its content from Firebase Storage</p>
      </div>
    );
  }, [chapterContent]);

  // Secure PDF viewer with automatic fallback
  const securePdfViewer = useMemo(() => {
    if (!pdfUrl) return null;

    return (
      <Suspense fallback={<Skeleton className="w-full h-[380px] rounded-md" />}>
        <SecurePDFViewer
          src={pdfUrl}
          title="Chapter PDF"
          className="w-full h-[380px] border-3 border-black rounded-md shadow-neo-sm"
          showControls={true}
        />
      </Suspense>
    );
  }, [pdfUrl]);

  // Advanced PDF viewer with controls
  const advancedPdfViewer = useMemo(() => {
    if (!pdfUrl) return null;

    return (
      <Suspense fallback={<Skeleton className="w-full h-[380px] rounded-md" />}>
        <PDFViewer
          src={pdfUrl}
          title="Chapter PDF"
          className="w-full h-[380px] border-3 border-black rounded-md shadow-neo-sm"
          showControls={true}
        />
      </Suspense>
    );
  }, [pdfUrl]);

  // Simple PDF viewer (current implementation)
  const simplePdfViewer = useMemo(() => {
    if (!pdfUrl) return null;

    return (
      <Suspense fallback={<Skeleton className="w-full h-[380px] rounded-md" />}>
        <iframe
          src={pdfUrl}
          className="w-full h-[380px] border-3 border-black rounded-md shadow-neo-sm"
          title="Chapter PDF"
          loading="lazy"
          allowFullScreen
        />
      </Suspense>
    );
  }, [pdfUrl]);

  return (
    <Card className="h-[500px] flex flex-col neo-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl">Chapter Content</CardTitle>
          {pdfUrl && (
            <div className="ml-auto flex gap-2">
              <Button
                size="sm"
                variant={viewerType === 'secure' ? 'default' : 'outline'}
                onClick={() => setViewerType('secure')}
                title="Secure viewer with automatic fallback"
              >
                Secure
              </Button>
              <Button
                size="sm"
                variant={viewerType === 'advanced' ? 'default' : 'outline'}
                onClick={() => setViewerType('advanced')}
                title="Advanced viewer with controls"
              >
                Advanced
              </Button>
              <Button
                size="sm"
                variant={viewerType === 'simple' ? 'default' : 'outline'}
                onClick={() => setViewerType('simple')}
                title="Simple iframe viewer"
              >
                Simple
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {pdfUrl ? (
          viewerType === 'secure' ? securePdfViewer :
          viewerType === 'advanced' ? advancedPdfViewer :
          simplePdfViewer
        ) : (
          <ScrollArea className="h-[380px] w-full pr-4 border-3 border-black rounded-md shadow-neo-sm">
            {contentDisplay}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
});

ChapterContentEnhanced.displayName = 'ChapterContentEnhanced';

export default ChapterContentEnhanced;
