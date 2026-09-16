import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { SITE_TITLE } from "@/lib/siteConfig";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRAND_STRIPE = ["#8D0801", "#FF7700", "#FCC100", "#1B623A"];

export default async function Image() {
  const logoBuffer = readFileSync(join(process.cwd(), "public", "votus_name.png"));
  const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FDF8EE",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoBase64} width={640} height={151} alt="" />
        <p
          style={{
            marginTop: 36,
            maxWidth: 820,
            textAlign: "center",
            fontSize: 34,
            fontWeight: 700,
            color: "#1B623A",
          }}
        >
          {SITE_TITLE.split("—")[1]?.trim() ?? "Informação para escolher com consciência"}
        </p>
        <div style={{ display: "flex", position: "absolute", bottom: 0, left: 0, right: 0, height: 22 }}>
          {BRAND_STRIPE.map((cor) => (
            <div key={cor} style={{ flex: 1, backgroundColor: cor }} />
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
