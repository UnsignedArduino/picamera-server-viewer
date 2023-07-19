import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import Head from "next/head";

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
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <body>{children}</body>
    </html>
  );
}
