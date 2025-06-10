import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCw, Download, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';

interface PDFViewerProps {
  src: string;
  title?: string;
  className?: string;
  showControls?: boolean;
}

/**
 * Optimized PDF Viewer component with performance enhancements
 */
const PDFViewer: React.FC<PDFViewerProps> = memo(({ 
  src, 
  title = "PDF Document", 
  className = "w-full h-full",
  showControls = false 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Memoize iframe URL with zoom parameter
  const iframeUrl = React.useMemo(() => {
    if (!src) return '';
    const url = new URL(src);
    if (showControls) {
      url.searchParams.set('zoom', zoom.toString());
    }
    return url.toString();
  }, [src, zoom, showControls]);

  // Handle iframe load events
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setError('Failed to load PDF document');
    toast.error('Failed to load PDF document');
  }, []);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 25, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 25, 50));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(100);
  }, []);

  // Download PDF
  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = title.endsWith('.pdf') ? title : `${title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('PDF download started');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  }, [src, title]);

  // Fullscreen mode
  const handleFullscreen = useCallback(() => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup any blob URLs if created
      if (src.startsWith('blob:')) {
        URL.revokeObjectURL(src);
      }
    };
  }, [src]);

  if (!src) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted rounded-md`}>
        <p className="text-muted-foreground">No PDF to display</p>
      </div>
    );
  }

  return (
    <div className={`${className} relative`}>
      {showControls && (
        <div className="absolute top-2 right-2 z-10 flex gap-1 bg-background/80 backdrop-blur-sm rounded-md p-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleResetZoom}
            title={`Reset Zoom (${zoom}%)`}
          >
            {zoom}%
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleFullscreen}
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownload}
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-md">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Loading PDF...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 rounded-md">
          <div className="text-center">
            <p className="text-destructive font-medium">{error}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={iframeUrl}
        title={title}
        className={`w-full h-full border-0 rounded-md ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-top-navigation-by-user-activation"
        allow="fullscreen"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
});

PDFViewer.displayName = 'PDFViewer';

export default PDFViewer;
