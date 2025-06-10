import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Download, Maximize2, Minimize2, ExternalLink, RefreshCw, RotateCcw, X } from 'lucide-react';
import { toast } from 'sonner';

interface SecurePDFViewerProps {
  src: string;
  title?: string;
  className?: string;
  showControls?: boolean;
}

/**
 * Secure PDF Viewer that handles Chrome's security restrictions
 * Uses multiple fallback methods to display PDFs
 */
const SecurePDFViewer: React.FC<SecurePDFViewerProps> = memo(({ 
  src, 
  title = "PDF Document", 
  className = "w-full h-full",
  showControls = false 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Smart default: use object for Firebase Storage URLs since Chrome blocks them in iframes
  const getInitialViewMode = useCallback(() => {
    if (src && src.includes('firebasestorage.googleapis.com')) {
      console.log('[SecurePDFViewer] Firebase URL detected, starting with object method');
      return 'object'; // Start with object for Firebase URLs
    }
    console.log('[SecurePDFViewer] Non-Firebase URL, starting with iframe method');
    return 'iframe'; // Use iframe for other URLs
  }, [src]);

  const [viewMode, setViewMode] = useState<'iframe' | 'object' | 'embed' | 'link'>(() => {
    // Initialize with proper detection
    if (src && src.includes('firebasestorage.googleapis.com')) {
      console.log('[SecurePDFViewer] Initial state: Firebase URL detected, using object method');
      return 'object';
    }
    console.log('[SecurePDFViewer] Initial state: Using iframe method');
    return 'iframe';
  });
  const [zoom, setZoom] = useState(100);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle iframe load events
  const handleLoad = useCallback(() => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
    setIsLoading(false);
    setError(null);
  }, []);

  const handleError = useCallback(() => {
    console.warn(`[SecurePDFViewer] ${viewMode} failed, trying next method...`);

    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }

    // Try different viewing methods in order
    if (viewMode === 'iframe') {
      console.log('[SecurePDFViewer] Iframe failed, switching to object tag...');
      setViewMode('object');
      setIsLoading(true);
      setError(null);
    } else if (viewMode === 'object') {
      console.log('[SecurePDFViewer] Object tag failed, switching to embed tag...');
      setViewMode('embed');
      setIsLoading(true);
      setError(null);
    } else if (viewMode === 'embed') {
      console.log('[SecurePDFViewer] Embed tag failed, showing fallback options...');
      setViewMode('link');
      setIsLoading(false);
      setError('PDF cannot be displayed inline due to browser security restrictions. Please use the download or open link options.');
    }
  }, [viewMode]);

  // Reset to appropriate mode when src changes and set timeout for loading detection
  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      return;
    }

    const initialMode = getInitialViewMode();
    setViewMode(initialMode);
    setIsLoading(true);
    setError(null);

    // Clear any existing timeout
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }

    // Set timeout to detect loading issues and clear loading state
    loadTimeoutRef.current = setTimeout(() => {
      console.warn('[SecurePDFViewer] Loading timeout detected');

      if (initialMode === 'iframe') {
        console.warn('[SecurePDFViewer] Iframe loading timeout, switching to object tag...');
        setViewMode('object');
        setIsLoading(true);
        setError(null);

        // Set another timeout for object method
        setTimeout(() => {
          if (isLoading) {
            console.warn('[SecurePDFViewer] Object loading timeout, switching to embed tag...');
            setViewMode('embed');
            setIsLoading(true);
            setError(null);

            // Final timeout for embed method
            setTimeout(() => {
              if (isLoading) {
                console.warn('[SecurePDFViewer] All methods timed out, showing fallback options...');
                setIsLoading(false);
                setViewMode('link');
                setError('PDF loading timed out. Please use the download or open link options below.');
              }
            }, 3000);
          }
        }, 3000);
      } else {
        // For non-iframe methods, just clear loading after timeout
        setIsLoading(false);
        if (initialMode === 'object') {
          console.warn('[SecurePDFViewer] Object method timeout, trying embed...');
          setViewMode('embed');
          setIsLoading(true);
          setTimeout(() => {
            if (isLoading) {
              setIsLoading(false);
              setViewMode('link');
              setError('PDF loading timed out. Please use the download or open link options below.');
            }
          }, 3000);
        }
      }
    }, 5000); // 5 second timeout for initial load

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
    };
  }, [src, getInitialViewMode]);

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

  // Open in new tab
  const handleOpenInNewTab = useCallback(() => {
    window.open(src, '_blank', 'noopener,noreferrer');
  }, [src]);

  // Fullscreen toggle mode
  const handleFullscreenToggle = useCallback(() => {
    if (!isFullscreen) {
      // Enter fullscreen
      if (containerRef.current) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          (containerRef.current as any).webkitRequestFullscreen();
        } else if ((containerRef.current as any).msRequestFullscreen) {
          (containerRef.current as any).msRequestFullscreen();
        }
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  }, [isFullscreen]);

  // Listen for fullscreen changes
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Retry with iframe
  const handleRetry = useCallback(() => {
    setViewMode('iframe');
    setIsLoading(true);
    setError(null);
  }, []);

  // Switch to next viewing method manually
  const handleSwitchMethod = useCallback(() => {
    if (viewMode === 'iframe') {
      setViewMode('object');
    } else if (viewMode === 'object') {
      setViewMode('embed');
    } else if (viewMode === 'embed') {
      setViewMode('iframe');
    }
    setIsLoading(true);
    setError(null);
  }, [viewMode]);

  // Stop loading manually
  const handleStopLoading = useCallback(() => {
    console.log('[SecurePDFViewer] Loading stopped manually by user');
    setIsLoading(false);
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
  }, []);

  // Create PDF URL with zoom if supported
  const pdfUrl = React.useMemo(() => {
    if (!src) return '';
    try {
      const url = new URL(src);
      if (showControls && viewMode === 'iframe') {
        url.searchParams.set('zoom', zoom.toString());
      }
      return url.toString();
    } catch {
      return src;
    }
  }, [src, zoom, showControls, viewMode]);

  const renderPDFViewer = () => {
    if (viewMode === 'iframe') {
      return (
        <iframe
          ref={iframeRef}
          src={pdfUrl}
          title={title}
          className="w-full h-full border-0 rounded-md"
          onLoad={(e) => {
            // Check if iframe content indicates blocking
            try {
              const iframe = e.target as HTMLIFrameElement;
              const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
              if (iframeDoc) {
                const bodyText = iframeDoc.body?.textContent || '';
                if (bodyText.includes('blocked by Chrome') || bodyText.includes('This page has been blocked')) {
                  console.warn('[SecurePDFViewer] Detected Chrome blocking message, switching to object tag...');
                  handleError();
                  return;
                }
              }
            } catch (e) {
              // Cross-origin restrictions prevent access, but that's normal
            }
            handleLoad();
          }}
          onError={handleError}
          loading="lazy"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-top-navigation-by-user-activation"
          allow="fullscreen"
          referrerPolicy="no-referrer-when-downgrade"
        />
      );
    } else if (viewMode === 'object') {
      return (
        <object
          data={pdfUrl}
          type="application/pdf"
          className="w-full h-full rounded-md"
          onLoad={() => {
            console.log('[SecurePDFViewer] Object loaded successfully');
            handleLoad();
          }}
          onError={() => {
            console.warn('[SecurePDFViewer] Object failed to load');
            handleError();
          }}
        >
          <div className="flex items-center justify-center h-full">
            <p className="text-center">
              Your browser doesn't support PDF viewing with this method.{' '}
              <button onClick={handleError} className="text-blue-500 underline hover:text-blue-700">
                Try alternative method
              </button>
            </p>
          </div>
        </object>
      );
    } else if (viewMode === 'embed') {
      return (
        <embed
          src={pdfUrl}
          type="application/pdf"
          className="w-full h-full rounded-md"
          onLoad={() => {
            console.log('[SecurePDFViewer] Embed loaded successfully');
            handleLoad();
          }}
          onError={() => {
            console.warn('[SecurePDFViewer] Embed failed to load');
            handleError();
          }}
        />
      );
    } else {
      // Fallback: Show download/open links
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-md p-8">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">PDF Viewer Restricted</h3>
            <p className="text-gray-600 max-w-md">
              Your browser's security settings prevent inline PDF viewing. 
              You can still access the PDF using the options below:
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleOpenInNewTab} variant="default">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
              <Button onClick={handleDownload} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={handleRetry} variant="ghost">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div ref={containerRef} className={`${className} relative`}>
      {showControls && viewMode !== 'link' && (
        <div className="absolute top-2 right-2 z-10 flex gap-1 bg-background/80 backdrop-blur-sm rounded-md p-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleFullscreenToggle}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleOpenInNewTab}
            title="Open in New Tab"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownload}
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </Button>
          {viewMode !== 'link' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSwitchMethod}
              title={`Switch to ${viewMode === 'iframe' ? 'Object' : viewMode === 'object' ? 'Embed' : 'Iframe'} method`}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading PDF...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-12 left-2 right-2 bg-yellow-50 border border-yellow-200 rounded-md p-2 text-sm text-yellow-800">
          {error}
        </div>
      )}



      {renderPDFViewer()}
    </div>
  );
});

SecurePDFViewer.displayName = 'SecurePDFViewer';

export default SecurePDFViewer;
