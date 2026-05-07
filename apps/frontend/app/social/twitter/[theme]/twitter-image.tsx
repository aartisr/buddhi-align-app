import { ImageResponse } from "next/og";
import { getSocialThemePalette, resolveSocialImageTheme } from "@/app/lib/social-image-theme";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function TwitterImage({ params }: { params: { theme: string } }) {
  const theme = resolveSocialImageTheme(params.theme);
  const palette = getSocialThemePalette(theme);

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
          background: palette.canvasGradient,
          color: palette.panelText,
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
          <div style={{ fontSize: 32, fontWeight: 900, color: palette.chipText, letterSpacing: 0 }}>
            Buddhi Align
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: palette.brandAccent }}>ForeverLotus</div>
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
          <div style={{ fontSize: 31, lineHeight: 1.35, color: palette.bodyText, maxWidth: 940 }}>
            Plan one intention. Record one practice. Reflect once. Share meaningful autograph keepsakes.
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 46 }}>
          {["Dharma", "Karma", "Bhakti", "Dhyana", "Jnana", "Autograph"].map((item) => (
            <div
              key={item}
              style={{
                padding: "11px 17px",
                borderRadius: 12,
                background: item === "Bhakti" || item === "Autograph" ? "#f6e7df" : "#e6f0eb",
                color: item === "Bhakti" || item === "Autograph" ? "#8b5147" : palette.chipText,
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
