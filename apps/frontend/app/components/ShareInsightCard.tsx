"use client";

import React, { useRef, useState, useEffect } from "react";
import "./share-insight.css";

interface ShareInsightCardProps {
  insightText: string;
  author: string;
  theme?: "dark" | "light";
}

export default function ShareInsightCard({ insightText, author, theme = "dark" }: ShareInsightCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions for high quality (e.g., 1080x1080 for Instagram)
    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    // Draw background
    if (theme === "dark") {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#0a1914");
      gradient.addColorStop(1, "#163a2e");
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = "#faf7f2";
    }
    ctx.fillRect(0, 0, width, height);

    // Draw decorative border
    ctx.strokeStyle = theme === "dark" ? "rgba(255, 246, 196, 0.15)" : "rgba(47, 93, 80, 0.15)";
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, width - 120, height - 120);

    // Text settings
    ctx.fillStyle = theme === "dark" ? "#fdfbf7" : "#0d2b21";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Draw Quote Mark
    ctx.font = "italic 180px Georgia, serif";
    ctx.fillStyle = theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)";
    ctx.fillText("\"", width / 2, height / 2 - 150);

    // Helper function for wrapping text
    const wrapText = (context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      const words = text.split(" ");
      let line = "";
      let currentY = y;
      
      const lines = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
          lines.push(line);
          line = words[n] + " ";
        } else {
          line = testLine;
        }
      }
      lines.push(line);
      
      // Calculate start Y to center block
      const totalHeight = lines.length * lineHeight;
      let startY = y - (totalHeight / 2);

      for (const line of lines) {
        context.fillText(line, x, startY);
        startY += lineHeight;
      }
    };

    ctx.fillStyle = theme === "dark" ? "#fdfbf7" : "#0d2b21";
    ctx.font = "500 48px 'Plus Jakarta Sans', system-ui, sans-serif";
    wrapText(ctx, insightText, width / 2, height / 2 - 40, width - 200, 70);

    // Draw Author
    ctx.font = "italic 400 36px Georgia, serif";
    ctx.fillStyle = theme === "dark" ? "#d4af37" : "#8e7323";
    ctx.fillText(`— ${author}`, width / 2, height / 2 + 180);

    // Draw Footer/Branding
    ctx.font = "600 28px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillStyle = theme === "dark" ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.4)";
    ctx.fillText("BUDDHI ALIGN", width / 2, height - 120);

    // Generate image URL
    setDownloadUrl(canvas.toDataURL("image/png"));
  }, [insightText, author, theme]);

  return (
    <div className="share-insight-container">
      <div className="share-insight-preview-wrapper">
        <canvas 
          ref={canvasRef} 
          style={{ width: "100%", maxWidth: "400px", height: "auto", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }} 
        />
      </div>
      
      <div className="share-insight-actions">
        {downloadUrl && (
          <a 
            href={downloadUrl} 
            download={`buddhi-sadhana-${new Date().getTime()}.png`}
            className="share-insight-download-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Save for Instagram / Story
          </a>
        )}
      </div>
    </div>
  );
}
