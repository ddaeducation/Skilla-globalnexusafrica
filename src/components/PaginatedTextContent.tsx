import { useRef, useEffect } from "react";

interface PaginatedTextContentProps {
  htmlContent: string;
  className?: string;
  onPageInfo?: (currentPage: number, totalPages: number, setPage: (page: number) => void) => void;
}

export default function PaginatedTextContent({ htmlContent, className, onPageInfo }: PaginatedTextContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Report as single page since we use scrolling now
    onPageInfo?.(1, 1, () => {});
  }, [htmlContent, onPageInfo]);

  useEffect(() => {
    // Scroll to top when content changes
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [htmlContent]);

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto custom-scrollbar"
      style={{ height: "calc(100vh - 140px)", minHeight: 400 }}
    >
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
}
