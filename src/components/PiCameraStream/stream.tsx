import React from "react";
import getElement from "@/util/Element";

export default function PiCameraStream(): JSX.Element {
  React.useEffect(() => {
    const wsStream = new WebSocket(
      `ws://${window.location.hostname}:4000/stream`,
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
    connectStream();
    return disconnectStream;
  }, []);

  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img id="stream" src="" alt="The PiCamera stream" />
    </div>
  );
}
