
import React, { memo, useMemo, Suspense, lazy } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface ChapterContentProps {
  chapterContent: string;
  pdfUrl: string | null;
}

// Lazy load PDF viewer for better performance
const PDFViewer = lazy(() => import('@/components/PDFViewer'));
const SecurePDFViewer = lazy(() => import('@/components/SecurePDFViewer'));

const ChapterContent: React.FC<ChapterContentProps> = memo(({ chapterContent, pdfUrl }) => {

  // Memoize content rendering to prevent unnecessary re-renders
  const contentDisplay = useMemo(() => {
    if (chapterContent && chapterContent.trim()) {
      return (
        <div className="prose max-w-none p-3 sm:p-4 whitespace-pre-wrap text-sm sm:text-base">
          {chapterContent}
        </div>
      );
    }
    return (
      <div className="text-center text-muted-foreground p-4">
        <p className="text-sm sm:text-base">Select a chapter to load its content from Firebase Storage</p>
      </div>
    );
  }, [chapterContent]);

  // Memoize PDF viewer to prevent unnecessary re-renders
  const pdfViewer = useMemo(() => {
    if (!pdfUrl) return null;

    return (
      <Suspense fallback={<Skeleton className="w-full h-[300px] sm:h-[330px] lg:h-[380px] rounded-md" />}>
        <SecurePDFViewer
          src={pdfUrl}
          title="Chapter PDF"
          className="w-full h-[300px] sm:h-[330px] lg:h-[380px] border-3 border-border rounded-md shadow-neo-sm"
          showControls={true}
        />
      </Suspense>
    );
  }, [pdfUrl]);

  return (
    <Card className="h-[400px] sm:h-[450px] lg:h-[500px] flex flex-col neo-card">
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base sm:text-lg lg:text-xl">Chapter Content</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-3 sm:p-6">
        {pdfUrl ? pdfViewer : (
          <ScrollArea className="h-[300px] sm:h-[330px] lg:h-[380px] w-full pr-2 sm:pr-4 border-3 border-border rounded-md shadow-neo-sm">
            {contentDisplay}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
});

export default ChapterContent;
