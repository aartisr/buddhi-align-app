import { ImageResponse } from "next/og";
import { getSocialThemePalette, resolveSocialImageTheme } from "@/app/lib/social-image-theme";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage({ params }: { params: { theme: string } }) {
  const theme = resolveSocialImageTheme(params.theme);
  const palette = getSocialThemePalette(theme);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: palette.panelBackground,
          color: palette.panelText,
          fontFamily: "Avenir Next, Inter, Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: "43%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "54px 42px",
            background: palette.heroGradient,
            color: "#fffaf0",
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 0 }}>ForeverLotus</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 76,
                fontWeight: 900,
                lineHeight: 0.96,
                letterSpacing: 0,
              }}
            >
              <span>Buddhi</span>
              <span>Align</span>
            </div>
            <div style={{ width: 112, height: 8, borderRadius: 99, background: palette.accent }} />
          </div>
          <div style={{ fontSize: 24, opacity: 0.95 }}>buddhi-align.foreverlotus.com</div>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "54px 56px",
            background: palette.canvasGradient,
          }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            {["Plan", "Practice", "Reflect", "Autograph"].map((item) => (
              <div
                key={item}
                style={{
                  padding: "10px 18px",
                  borderRadius: 999,
                  border: `2px solid ${palette.chipBorder}`,
                  background: "#ffffff",
                  color: palette.chipText,
                  fontSize: 22,
                  fontWeight: 800,
                }}
              >
                {item}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 52,
                fontWeight: 900,
                lineHeight: 1.06,
                letterSpacing: 0,
                maxWidth: 650,
              }}
            >
              <span>Ancient wisdom,</span>
              <span>daily practice analytics.</span>
            </div>
            <div style={{ fontSize: 28, lineHeight: 1.35, color: palette.bodyText, maxWidth: 640 }}>
              Dharma planning, meditation, service, gratitude, self-inquiry, Autograph Exchange, community, and gentle growth insights in one calm app.
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, color: palette.brandAccent, fontSize: 23, fontWeight: 800 }}>
            <span>#spiritualpractice</span>
            <span>#mindfulness</span>
            <span>#dailyreflection</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
