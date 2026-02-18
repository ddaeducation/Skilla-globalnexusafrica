import React, { useEffect, useState } from "react";

interface Placeholder {
  id: string;
  type: "student_name" | "course_name" | "date" | "certificate_id" | "instructor_name" | "school_name" | "custom" | "qr_code";
  label: string;
  x: number;
  y: number;
  width?: number;
  fontSize: number;
  fontWeight: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  textAlign?: "left" | "center" | "right";
  color: string;
  customText?: string;
}

export interface CertificateData {
  studentName: string;
  courseName: string;
  schoolName: string;
  certificateNumber: string;
  issueDate: string;
  instructorName: string;
  verificationUrl: string;
  template?: {
    placeholders: Placeholder[];
    width: number;
    height: number;
    background_url?: string | null;
  };
}

interface CertificateRendererProps {
  data: CertificateData;
  scale?: number; // for preview sizing
  onReady?: () => void; // called once QR codes are loaded and ready for capture
}

/**
 * Generates a QR code as a base64 PNG data URL using the local `qrcode` package.
 * This avoids any cross-origin issues with html2canvas.
 */
async function generateQRDataUrl(text: string, size: number): Promise<string> {
  const QRCode = (await import("qrcode")).default;
  return QRCode.toDataURL(text, {
    width: size,
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });
}

function getPlaceholderText(ph: Placeholder, data: CertificateData): string {
  switch (ph.type) {
    case "student_name": return data.studentName;
    case "course_name": return data.courseName;
    case "date": return data.issueDate;
    case "certificate_id": return data.certificateNumber;
    case "instructor_name": return data.instructorName;
    case "school_name": return data.schoolName;
    case "custom": return ph.customText || "";
    default: return "";
  }
}

/**
 * Renders a certificate template exactly as designed — used both for preview
 * and as the source for html2canvas PDF capture.
 *
 * When `scale` is provided the canvas is scaled down for preview;
 * for PDF capture pass scale=1 (or omit).
 */
const CertificateRenderer = React.forwardRef<HTMLDivElement, CertificateRendererProps>(
  ({ data, scale = 1, onReady }, ref) => {
    const template = data.template;
    const width = template?.width || 842;
    const height = template?.height || 595;

    // Pre-fetch QR codes as base64 so html2canvas can render them cross-origin
    const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({});

    useEffect(() => {
      if (!template?.placeholders) {
        onReady?.();
        return;
      }
      const qrPlaceholders = template.placeholders.filter((ph) => ph.type === "qr_code");
      if (qrPlaceholders.length === 0) {
        // No QR codes — ready immediately
        onReady?.();
        return;
      }

      Promise.all(
        qrPlaceholders.map(async (ph) => {
          const size = Math.round(ph.width || 150);
          const dataUrl = await generateQRDataUrl(data.verificationUrl, size);
          return [ph.id, dataUrl] as [string, string];
        })
      ).then((entries) => {
        setQrDataUrls(Object.fromEntries(entries));
        // Signal that QR codes are now in state and React will re-render
        // Use rAF to ensure the DOM has been painted with the new images
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            onReady?.();
          });
        });
      });
    }, [template, data.verificationUrl]);

    const containerStyle: React.CSSProperties = {
      position: "relative",
      width: width * scale,
      height: height * scale,
      overflow: "hidden",
      backgroundColor: "#ffffff",
      fontFamily: "Helvetica, Arial, sans-serif",
    };

    if (!template || template.placeholders.length === 0) {
      // Default fallback layout
      return (
        <div ref={ref} style={containerStyle}>
          {template?.background_url && (
            <img
              src={template.background_url}
              alt=""
              crossOrigin="anonymous"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
          <div style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", padding: 40 * scale, gap: 16 * scale,
          }}>
            <div style={{ fontSize: 36 * scale, fontWeight: "bold", color: "#1a4e8a" }}>Certificate of Completion</div>
            <div style={{ fontSize: 14 * scale, color: "#555" }}>This is to certify that</div>
            <div style={{ fontSize: 28 * scale, fontWeight: "bold", color: "#111" }}>{data.studentName}</div>
            <div style={{ fontSize: 14 * scale, color: "#555" }}>has successfully completed the course</div>
            <div style={{ fontSize: 22 * scale, fontWeight: "bold", color: "#1a4e8a" }}>{data.courseName}</div>
            <div style={{ fontSize: 12 * scale, color: "#666" }}>School: {data.schoolName}</div>
            <div style={{ fontSize: 12 * scale, color: "#555" }}>Instructor: {data.instructorName}</div>
            <div style={{ fontSize: 10 * scale, color: "#999", marginTop: 8 * scale }}>
              Certificate #{data.certificateNumber} · {data.issueDate}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} style={containerStyle}>
        {/* Background image */}
        {template.background_url && (
          <img
            src={template.background_url}
            alt=""
            crossOrigin="anonymous"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "fill",
              display: "block",
            }}
          />
        )}

        {/* Placeholders */}
        {template.placeholders.map((ph) => {
          const isQR = ph.type === "qr_code";
          const placeholderWidth = (ph.width || 150) * scale;
          const placeholderHeight = isQR ? placeholderWidth : (ph.fontSize + 8) * scale;

          const containerStyle: React.CSSProperties = {
            position: "absolute",
            left: ph.x * scale,
            top: ph.y * scale,
            width: placeholderWidth,
            height: placeholderHeight,
          };

          if (isQR) {
            // Use pre-generated base64 data URL; fallback renders nothing until ready
            const qrSrc = qrDataUrls[ph.id] || "";
            if (!qrSrc) return null; // wait until QR data URL is ready
            return (
              <div key={ph.id} style={containerStyle}>
                <img
                  src={qrSrc}
                  alt="Verification QR Code"
                  style={{ width: "100%", height: "100%", display: "block" }}
                />
              </div>
            );
          }

          const text = getPlaceholderText(ph, data);
          if (!text) return null;

          const textStyle: React.CSSProperties = {
            fontSize: ph.fontSize * scale,
            fontWeight: ph.fontWeight,
            fontStyle: ph.fontStyle || "normal",
            textAlign: ph.textAlign || "center",
            color: ph.color,
            width: "100%",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            overflow: "visible",
            display: "block",
          };

          return (
            <div key={ph.id} style={containerStyle}>
              <span style={textStyle}>{text}</span>
            </div>
          );
        })}
      </div>
    );
  }
);

CertificateRenderer.displayName = "CertificateRenderer";

export default CertificateRenderer;
