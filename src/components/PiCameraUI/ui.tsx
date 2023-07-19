import React from "react";
import PiCameraControl from "@/components/PiCameraControl";
import PiCameraStream from "@/components/PiCameraStream";

export default function PiCameraUI(): JSX.Element {
  const wsStreamRef = React.useRef<WebSocket>();
  const wsControlRef = React.useRef<WebSocket>();
  const wsStreamCbRef = React.useRef<(_e: MessageEvent) => void>();
  const wsControlCbRef = React.useRef<(_e: MessageEvent) => void>();
  const wsControlSendCbRef = React.useRef<(_d: string) => void>();
  const [status, setStatus] = React.useState("Disconnected.");
  let connectedWs = 0;
  const [showUI, setShowUI] = React.useState(false);

  const disconnect = () => {
    console.log("Disconnecting all websockets");
    wsStreamRef.current?.close();
    wsControlRef.current?.close();
    connectedWs = 0;
    setShowUI(false);
    setStatus("Disconnected.");
  };

  const connect = () => {
    disconnect();
    setStatus("Connecting... (0/2)");

    const wsControl = new WebSocket(
      `ws://${window.location.hostname}:4000/control`,
    );
    const wsStream = new WebSocket(
      `ws://${window.location.hostname}:4000/stream`,
    );
    wsControl.addEventListener("open", () => {
      console.log("Control websocket connected!");
      wsControlRef.current = wsControl;
      wsControlSendCbRef.current = (d: string) => {
        wsControl.send(d);
      };
      connectedWs++;
      setStatus(`Connecting... (${connectedWs}/2)`);
      if (connectedWs === 2) {
        console.log("All websockets connected!");
        setStatus("Connected!");
        setShowUI(true);
      }
    });
    wsStream.addEventListener("open", () => {
      console.log("Stream websocket connected!");
      wsStreamRef.current = wsStream;
      connectedWs++;
      setStatus(`Connecting... (${connectedWs}/2)`);
      if (connectedWs === 2) {
        console.log("All websockets connected!");
        setStatus("Connected!");
        setShowUI(true);
      }
    });
    wsControl.addEventListener("message", (e) => {
      if (wsControlCbRef.current != null) {
        wsControlCbRef.current(e);
      }
      const d = JSON.parse(e.data);
      if (d.type === "status") {
        console.log("Received new status update");
        setStatus(d.status);
      }
    });
    wsStream.addEventListener("message", (e) => {
      if (wsStreamCbRef.current != null) {
        wsStreamCbRef.current(e);
      }
    });
    wsControl.addEventListener("close", () => {
      console.log("Control websocket closed");
      disconnect();
    });
    wsStream.addEventListener("close", () => {
      console.log("Control websocket closed");
      disconnect();
    });
    wsControl.addEventListener("error", () => {
      console.log("Control websocket closed due to error");
      disconnect();
    });
    wsStream.addEventListener("error", () => {
      console.log("Control websocket closed due to error");
      disconnect();
    });
  };

  React.useEffect(() => {
    return connect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="container-fluid">
      <div className="row pt-2">
        <div
          className="col ps-2 pe-0"
          style={{ minWidth: "75vw", maxWidth: "75vw" }}
        >
          <PiCameraStream wsOnMsgEventCbRef={wsStreamCbRef} hide={!showUI} />
          <p>{status}</p>
        </div>
        <div className="col">
          <PiCameraControl
            wsOnMsgEventCbRef={wsControlCbRef}
            wsSendRef={wsControlSendCbRef}
            hide={!showUI}
          />
        </div>
      </div>
    </div>
  );
}
