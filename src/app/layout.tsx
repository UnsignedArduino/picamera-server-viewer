import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PiCamera Server",
  description: "View and control your camera stream in the browser!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
