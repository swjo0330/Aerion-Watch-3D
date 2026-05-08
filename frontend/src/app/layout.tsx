import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkyWatch-RT | 드론 관제 시스템",
  description: "실시간 드론 모니터링 및 관제 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased`}
    >
      <head>
        <link rel="stylesheet" href="/cesium/Widgets/widgets.css" />
      </head>
      <body className="h-full bg-background text-foreground">
        {/* CesiumJS 정적 자산 기본 경로 설정 */}
        <script dangerouslySetInnerHTML={{ __html: 'window.CESIUM_BASE_URL="/cesium";' }} />
        {children}
      </body>
    </html>
  );
}
