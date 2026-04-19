import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function TwitterImage() {
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
          background: "linear-gradient(140deg, #1b4332 0%, #2d6a4f 55%, #40916c 100%)",
          color: "#f8fff7",
          fontFamily: "Georgia, Cambria, Times New Roman, Times, serif",
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.95 }}>Buddhi Align</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.06 }}>
            Focused Mind.
          </div>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.06 }}>
            Purposeful Life.
          </div>
        </div>
        <div style={{ fontSize: 24, opacity: 0.92 }}>ForeverLotus</div>
      </div>
    ),
    {
      ...size,
    },
  );
}
