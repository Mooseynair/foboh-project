"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

const SWAGGER_VERSION = "5.18.2";
const SWAGGER_CSS = `https://unpkg.com/swagger-ui-dist@${SWAGGER_VERSION}/swagger-ui.css`;
const SWAGGER_JS = `https://unpkg.com/swagger-ui-dist@${SWAGGER_VERSION}/swagger-ui-bundle.js`;

declare global {
  interface Window {
    SwaggerUIBundle?: (config: {
      url: string;
      dom_id: string;
      deepLinking?: boolean;
      docExpansion?: "list" | "full" | "none";
    }) => unknown;
  }
}

export default function ApiDocsPage() {
  const mounted = useRef(false);

  const init = () => {
    if (mounted.current || typeof window === "undefined") return;
    if (!window.SwaggerUIBundle) return;
    mounted.current = true;
    window.SwaggerUIBundle({
      url: "/api/openapi.json",
      dom_id: "#swagger-ui",
      deepLinking: true,
      docExpansion: "list",
    });
  };

  // Cover the case where the script was already cached/loaded before this
  // component mounted (e.g. client-side nav back to this page).
  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <link rel="stylesheet" href={SWAGGER_CSS} />
      <Script src={SWAGGER_JS} strategy="afterInteractive" onReady={init} />
      <div id="swagger-ui" />
    </>
  );
}
