import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginatedTextContentProps {
  htmlContent: string;
  className?: string;
}

export default function PaginatedTextContent({ htmlContent, className }: PaginatedTextContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageHeight, setPageHeight] = useState(500);

  const calculatePages = useCallback(() => {
    if (!contentRef.current || !containerRef.current) return;
    const containerH = containerRef.current.clientHeight || 500;
    // Reserve space for pagination controls
    const usableHeight = containerH - 60;
    setPageHeight(usableHeight);
    const scrollH = contentRef.current.scrollHeight;
    const pages = Math.max(1, Math.ceil(scrollH / usableHeight));
    setTotalPages(pages);
    if (currentPage > pages) setCurrentPage(pages);
  }, [currentPage]);

  useEffect(() => {
    calculatePages();
    const observer = new ResizeObserver(calculatePages);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [calculatePages, htmlContent]);

  // Reset to page 1 when content changes
  useEffect(() => {
    setCurrentPage(1);
  }, [htmlContent]);

  const scrollOffset = (currentPage - 1) * pageHeight;

  return (
    <div ref={containerRef} className="flex flex-col" style={{ height: "calc(100vh - 320px)", minHeight: 400 }}>
      {/* Content area with overflow hidden to simulate pages */}
      <div className="flex-1 overflow-hidden relative">
        <div
          ref={contentRef}
          className={className}
          style={{
            transform: `translateY(-${scrollOffset}px)`,
            transition: "transform 0.3s ease",
          }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4 pb-2 border-t bg-background">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
