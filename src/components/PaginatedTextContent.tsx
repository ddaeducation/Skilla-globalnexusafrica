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
    setPageHeight(containerH);
    const scrollH = contentRef.current.scrollHeight;
    const pages = Math.max(1, Math.ceil(scrollH / containerH));
    setTotalPages(pages);
    if (currentPage > pages) setCurrentPage(pages);
  }, [currentPage]);

  useEffect(() => {
    // Small delay to let layout settle
    const timer = setTimeout(calculatePages, 100);
    const observer = new ResizeObserver(() => setTimeout(calculatePages, 50));
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [calculatePages, htmlContent]);

  useEffect(() => {
    setCurrentPage(1);
  }, [htmlContent]);

  const scrollOffset = (currentPage - 1) * pageHeight;

  return (
    <div className="relative flex items-stretch">
      {/* Left arrow */}
      {totalPages > 1 && (
        <div className="flex items-center pr-2 shrink-0">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-30"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden"
          style={{ height: "calc(100vh - 340px)", minHeight: 350 }}
        >
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

        {/* Page indicator */}
        {totalPages > 1 && (
          <div className="text-center pt-2">
            <span className="text-xs font-medium text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        )}
      </div>

      {/* Right arrow */}
      {totalPages > 1 && (
        <div className="flex items-center pl-2 shrink-0">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-30"
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
