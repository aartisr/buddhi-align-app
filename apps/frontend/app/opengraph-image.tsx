import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          background:
            "radial-gradient(circle at 20% 20%, #95d5b2 0%, #2d6a4f 45%, #1b4332 100%)",
          color: "#f8fff7",
          fontFamily: "Georgia, Cambria, Times New Roman, Times, serif",
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.95 }}>ForeverLotus</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05 }}>
            Buddhi Align
          </div>
          <div style={{ fontSize: 32, opacity: 0.95, maxWidth: "90%" }}>
            Practical spiritual discipline for clarity, reflection, and daily growth.
          </div>
        </div>
        <div style={{ fontSize: 24, opacity: 0.92 }}>buddhi-align.foreverlotus.com</div>
      </div>
    ),
    {
      ...size,
    },
  );
}
