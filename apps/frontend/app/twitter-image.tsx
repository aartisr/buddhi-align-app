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
          justifyContent: "center",
          padding: "56px 66px",
          background: "linear-gradient(135deg, #fbfdf8 0%, #fff6e3 52%, #e9f4ef 100%)",
          color: "#17362d",
          fontFamily: "Avenir Next, Inter, Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 42,
          }}
        >
          <div style={{ fontSize: 32, fontWeight: 900, color: "#2f5d50", letterSpacing: 0 }}>
            Buddhi Align
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#9d6153" }}>ForeverLotus</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 70,
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: 0,
            }}
          >
            <span>The calm daily loop</span>
            <span>for spiritual growth.</span>
          </div>
          <div style={{ fontSize: 31, lineHeight: 1.35, color: "#31463f", maxWidth: 940 }}>
            Plan one intention. Record one practice. Reflect once. Watch consistency become visible.
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 46 }}>
          {["Dharma", "Karma", "Bhakti", "Dhyana", "Jnana", "Vasana"].map((item) => (
            <div
              key={item}
              style={{
                padding: "11px 17px",
                borderRadius: 12,
                background: item === "Bhakti" || item === "Vasana" ? "#f6e7df" : "#e6f0eb",
                color: item === "Bhakti" || item === "Vasana" ? "#8b5147" : "#2f5d50",
                fontSize: 23,
                fontWeight: 800,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
