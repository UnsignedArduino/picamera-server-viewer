"use client";

import React from "react";
import getElement from "@/util/Element";

export default function Home() {
  React.useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.hostname}:4000/stream`);
    const img = getElement("stream") as HTMLImageElement;
    const imgOnLoadEvent = (e: Event) => {
      URL.revokeObjectURL((e.target as HTMLImageElement).src);
    };
    img.addEventListener("onload", imgOnLoadEvent);
    const wsOnMsgEvent = (e: MessageEvent) => {
      img.src = URL.createObjectURL(e.data);
    };
    ws.addEventListener("message", wsOnMsgEvent);
    console.log("Started websocket stream due to mount");

    return () => {
      img.removeEventListener("onload", imgOnLoadEvent);
      ws.removeEventListener("message", wsOnMsgEvent);
      console.log("Stopped websocket stream due to unmount");
    };
  });

  return (
    <main>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img id="stream" src="" alt="The PiCamera stream" />
    </main>
  );
}
