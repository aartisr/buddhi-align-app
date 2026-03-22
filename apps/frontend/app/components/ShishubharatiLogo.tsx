import React from "react";
import Image from "next/image";

export default function ShishubharatiLogo() {
  return (
    <Image
      src="https://www.shishubharati.net/wp-content/uploads/2024/07/ShishuBharati-Logo-Transparent-HiRes-150x150.png"
      alt="Shishu Bharati School Logo"
      width={36}
      height={36}
      style={{ height: 36, marginRight: 8, verticalAlign: "middle" }}
      loading="lazy"
      unoptimized
    />
  );
}
