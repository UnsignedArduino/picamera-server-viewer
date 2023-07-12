"use client";

import React from "react";
import getElement from "@/util/Element";

export default function Home() {
  React.useEffect(() => {
    const wsStream = new WebSocket(
      `ws://${window.location.hostname}:4000/stream`,
    );
    const wsControl = new WebSocket(
      `ws://${window.location.hostname}:4000/control`,
    );
    const img = getElement("stream") as HTMLImageElement;

    const imgOnLoadEvent = (e: Event) => {
      URL.revokeObjectURL((e.target as HTMLImageElement).src);
    };
    const wsStreamOnMsgEvent = (e: MessageEvent) => {
      img.src = URL.createObjectURL(e.data);
    };
    const connectStream = () => {
      img.addEventListener("onload", imgOnLoadEvent);
      wsStream.addEventListener("message", wsStreamOnMsgEvent);
      console.log("Started websocket stream due to mount");
    };
    const disconnectStream = () => {
      img.removeEventListener("onload", imgOnLoadEvent);
      wsStream.removeEventListener("message", wsStreamOnMsgEvent);
      wsStream.close();
      console.log("Stopped websocket stream due to unmount");
    };
    const wsControlOnMsgEvent = (e: MessageEvent) => {
      console.log(e.data);
    };
    const connectControl = () => {
      wsControl.addEventListener("message", wsControlOnMsgEvent);
      console.log("Started websocket control due to mount");
    };
    const disconnectControl = () => {
      wsControl.removeEventListener("message", wsControlOnMsgEvent);
      wsControl.close();
      console.log("Stopped websocket control due to unmount");
    };

    connectStream();
    connectControl();

    return () => {
      disconnectStream();
      disconnectControl();
    };
  });

  return (
    <main>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img id="stream" src="" alt="The PiCamera stream" />
    </main>
  );
}
