import { useState, useEffect, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  Presentation,
  ZoomIn,
  ZoomOut,
  Grid3X3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PdfPresentationViewerProps {
  url: string;
  title?: string;
}

export default function PdfPresentationViewer({ url, title }: PdfPresentationViewerProps) {
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPresenting, setIsPresenting] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [scale, setScale] = useState(1);
  const [controlsVisible, setControlsVisible] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbnailCanvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const renderTaskRef = useRef<any>(null);

  // Load the PDF document
  useEffect(() => {
    let cancelled = false;
    pdfjsLib.getDocument(url).promise.then((doc) => {
      if (!cancelled) {
        setPdf(doc);
        setTotalPages(doc.numPages);
      }
    });
    return () => { cancelled = true; };
  }, [url]);

  // Render current page
  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdf || !canvasRef.current) return;
    
    // Cancel any in-progress render
    if (renderTaskRef.current) {
      try { renderTaskRef.current.cancel(); } catch {}
    }

    const page = await pdf.getPage(pageNum);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate scale to fit container
    const container = containerRef.current;
    const containerW = container?.clientWidth || 960;
    const containerH = container?.clientHeight || 540;
    const viewport = page.getViewport({ scale: 1 });
    const fitScale = Math.min(containerW / viewport.width, containerH / viewport.height) * scale;
    const scaledViewport = page.getViewport({ scale: fitScale });

    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    const task = page.render({ canvasContext: ctx, viewport: scaledViewport });
    renderTaskRef.current = task;
    try { await task.promise; } catch {}
  }, [pdf, scale]);

  useEffect(() => {
    renderPage(currentPage);
  }, [currentPage, renderPage, isPresenting]);

  // Resize handler
  useEffect(() => {
    const onResize = () => renderPage(currentPage);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [currentPage, renderPage]);

  // Keyboard navigation
  useEffect(() => {
    if (!isPresenting) return;
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
        case " ":
          e.preventDefault();
          setCurrentPage((p) => Math.min(p + 1, totalPages));
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          setCurrentPage((p) => Math.max(p - 1, 1));
          break;
        case "Escape":
          e.preventDefault();
          exitPresentation();
          break;
        case "Home":
          e.preventDefault();
          setCurrentPage(1);
          break;
        case "End":
          e.preventDefault();
          setCurrentPage(totalPages);
          break;
        case "g":
          setShowGrid((v) => !v);
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isPresenting, totalPages]);

  // Auto-hide controls in presentation mode
  useEffect(() => {
    if (!isPresenting) return;
    const handleMove = () => {
      setControlsVisible(true);
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3000);
    };
    handleMove();
    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      clearTimeout(hideTimerRef.current);
    };
  }, [isPresenting]);

  const enterPresentation = async () => {
    setIsPresenting(true);
    setShowGrid(false);
    try {
      await document.documentElement.requestFullscreen();
    } catch {}
  };

  const exitPresentation = () => {
    setIsPresenting(false);
    setScale(1);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Listen for fullscreen exit
  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement && isPresenting) {
        setIsPresenting(false);
        setScale(1);
      }
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, [isPresenting]);

  // Render thumbnail
  const renderThumbnail = useCallback(async (pageNum: number, canvas: HTMLCanvasElement) => {
    if (!pdf) return;
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 0.3 });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    await page.render({ canvasContext: ctx, viewport }).promise;
  }, [pdf]);

  // Grid view
  const GridView = () => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
      <div className="absolute inset-0 z-30 bg-background/95 backdrop-blur-sm overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">All Slides ({totalPages})</h3>
          <Button variant="ghost" size="icon" onClick={() => setShowGrid(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {pages.map((num) => (
            <button
              key={num}
              onClick={() => { setCurrentPage(num); setShowGrid(false); }}
              className={cn(
                "group relative rounded-lg border-2 overflow-hidden transition-all hover:shadow-lg",
                currentPage === num ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
              )}
            >
              <canvas
                ref={(el) => {
                  if (el && pdf) {
                    thumbnailCanvasRefs.current.set(num, el);
                    renderThumbnail(num, el);
                  }
                }}
                className="w-full h-auto"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <span className="text-white text-xs font-medium">{num}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (!pdf) {
    return (
      <div className="flex items-center justify-center h-[400px] border rounded-lg bg-muted/30">
        <div className="animate-pulse text-muted-foreground">Loading PDF...</div>
      </div>
    );
  }

  // Inline (non-presentation) mode
  if (!isPresenting) {
    return (
      <div className="space-y-3">
        <div
          ref={containerRef}
          className="relative flex items-center justify-center bg-muted/30 border rounded-lg overflow-hidden"
          style={{ minHeight: 500 }}
        >
          {showGrid && <GridView />}
          <canvas ref={canvasRef} className="max-w-full max-h-[600px]" />
        </div>

        {/* Controls bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2 min-w-[80px] text-center">
              {currentPage} / {totalPages}
            </span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setShowGrid((v) => !v)} title="Grid overview">
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setScale((s) => Math.max(s - 0.25, 0.5))} title="Zoom out">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(scale * 100)}%</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setScale((s) => Math.min(s + 0.25, 3))} title="Zoom in">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="default" size="sm" onClick={enterPresentation} className="ml-2">
              <Presentation className="w-4 h-4 mr-1" />
              Present
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fullscreen presentation mode
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center select-none"
      style={{ cursor: controlsVisible ? "default" : "none" }}
    >
      {showGrid ? (
        <GridView />
      ) : (
        <canvas ref={canvasRef} className="max-w-full max-h-full" />
      )}

      {/* Top bar */}
      <div
        className={cn(
          "absolute top-0 inset-x-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300",
          controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <span className="text-white/80 text-sm font-medium truncate max-w-[60%]">{title || "PDF Presentation"}</span>
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-xs">{currentPage} / {totalPages}</span>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8" onClick={() => setShowGrid((v) => !v)}>
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8" onClick={exitPresentation}>
            <Minimize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Side navigation */}
      <button
        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className={cn(
          "absolute left-0 top-0 bottom-0 w-20 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-opacity duration-300 disabled:opacity-0",
          controlsVisible ? "opacity-100" : "opacity-0"
        )}
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={cn(
          "absolute right-0 top-0 bottom-0 w-20 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-opacity duration-300 disabled:opacity-0",
          controlsVisible ? "opacity-100" : "opacity-0"
        )}
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Bottom progress */}
      <div
        className={cn(
          "absolute bottom-0 inset-x-0 h-1 bg-white/10 transition-opacity duration-300",
          controlsVisible ? "opacity-100" : "opacity-0"
        )}
      >
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(currentPage / totalPages) * 100}%` }}
        />
      </div>
    </div>
  );
}
