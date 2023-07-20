import React from "react";
import PiCameraControl from "@/components/PiCameraControl";
import PiCameraStream from "@/components/PiCameraStream";
import getElement from "@/util/Element";

export default function PiCameraUI(): JSX.Element {
  const wsStreamRef = React.useRef<WebSocket>();
  const wsControlRef = React.useRef<WebSocket>();
  const wsStreamCbRef = React.useRef<(_e: MessageEvent) => void>();
  const wsControlCbRef = React.useRef<(_e: MessageEvent) => void>();
  const wsControlSendCbRef = React.useRef<(_d: string) => void>();
  const [status, setStatus] = React.useState("Disconnected.");
  let connectedWs = 0;
  const [showUI, setShowUI] = React.useState(false);
  const [disableConnectUI, setDisableConnectUI] = React.useState(false);
  const [serverURL, setServerURL] = React.useState("");
  const [serverPort, setServerPort] = React.useState<number>(NaN);
  const [serverUseSSL, setServerUseSSL] = React.useState(true);
  const [tryConnectResponse, setTryConnectResponse] = React.useState("");

  const disconnect = (dueToError: boolean = false) => {
    console.log("Disconnecting all websockets");
    wsStreamRef.current?.close();
    wsControlRef.current?.close();
    connectedWs = 0;
    setShowUI(false);
    setDisableConnectUI(false);
    if (dueToError) {
      setStatus("Disconnected or failed to connect!");
      setTryConnectResponse("Disconnected or failed to connect!");
    } else {
      setStatus("Disconnected.");
      setTryConnectResponse("Disconnected.");
    }
  };

  const connect = (
    url: string,
    port: number = 4000,
    useSSL: boolean = true,
  ) => {
    disconnect();
    setDisableConnectUI(true);
    setStatus("Connecting... (0/2)");
    setTryConnectResponse("");

    const base = `ws${useSSL ? "s" : ""}://${url}${
      isNaN(port) ? "" : `:${port}`
    }`;

    console.log("Connecting to " + base);

    const wsControl = new WebSocket(`${base}/control`);
    const wsStream = new WebSocket(`${base}/stream`);
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
    const wsControlCloseCb = () => {
      console.log("Control websocket closed");
      disconnect();
    };
    wsControl.addEventListener("close", wsControlCloseCb);
    const wsStreamCloseCb = () => {
      console.log("Control websocket closed");
      disconnect();
    };
    wsStream.addEventListener("close", wsStreamCloseCb);
    wsControl.addEventListener("error", () => {
      console.log("Control websocket closed due to error");
      wsControl.removeEventListener("close", wsControlCloseCb);
      wsStream.removeEventListener("close", wsStreamCloseCb);
      disconnect(true);
    });
    wsStream.addEventListener("error", () => {
      console.log("Control websocket closed due to error");
      wsControl.removeEventListener("close", wsControlCloseCb);
      wsStream.removeEventListener("close", wsStreamCloseCb);
      disconnect(true);
    });
  };

  return (
    <div
      className="container g-0 py-2 d-block"
      style={{
        minWidth: "100vw",
        maxWidth: "100vw",
        minHeight: "100vh",
        maxHeight: "100vh",
      }}
    >
      <div className="row m-0 p-0 d-block">
        <div className="row m-0 gx-2">
          <div
            className="col d-block"
            style={{
              minWidth: "75vw",
              maxWidth: "75vw",
              minHeight: "95vh",
              maxHeight: "95vh",
            }}
          >
            <PiCameraStream wsOnMsgEventCbRef={wsStreamCbRef} hide={!showUI} />
          </div>
          <div className="col d-block">
            <PiCameraControl
              wsOnMsgEventCbRef={wsControlCbRef}
              wsSendRef={wsControlSendCbRef}
              hide={!showUI}
            />
            {!showUI ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setDisableConnectUI(true);
                  const url = (getElement("serverURLInput") as HTMLInputElement)
                    .value;
                  setServerURL(url);
                  const port = parseInt(
                    (getElement("serverPortInput") as HTMLInputElement).value,
                  );
                  const useSSL = (
                    getElement("serverUseSSLInput") as HTMLInputElement
                  ).checked;
                  setServerPort(port);
                  setTimeout(() => {
                    connect(url, port, useSSL);
                  }, 100);
                }}
              >
                <h3>Connect</h3>
                <div className="mb-2">
                  <label htmlFor="serverURLInput" className="form-label">
                    Server URL:
                  </label>
                  <input
                    type="text"
                    id="serverURLInput"
                    className="form-control"
                    defaultValue={serverURL}
                    onChange={(e) => {
                      setServerURL(e.target.value);
                    }}
                    disabled={disableConnectUI}
                  />
                  <div className="form-text">
                    This is the tunnel URL or the IP address of your Raspberry
                    Pi.
                  </div>
                </div>
                <div className="mb-2">
                  <label htmlFor="serverPortInput" className="form-label">
                    Server port:
                  </label>
                  <input
                    type="number"
                    id="serverPortInput"
                    className="form-control"
                    defaultValue={serverPort}
                    disabled={disableConnectUI}
                    min={0}
                    max={2 ** 16 - 1}
                    onChange={(e) => {
                      setServerPort(parseInt(e.target.value));
                    }}
                  />
                  <div className="form-text">
                    This is the port the server is running on. You can leave
                    this empty unless you are not using a tunnel, in which case
                    it defaults to <code>4000</code> and should not be changed
                    unless you have modified the server program to run on a
                    different port.
                  </div>
                </div>
                <div className="mb-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      defaultChecked={serverUseSSL}
                      id="serverUseSSLInput"
                      onChange={(e) => {
                        setServerUseSSL(e.target.checked);
                      }}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="serverUseSSLInput"
                    >
                      Use SSL
                    </label>
                  </div>
                  <div className="form-text">
                    Whether to use HTTPS or HTTP when connecting. You probably
                    want to keep this checked.
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={disableConnectUI || serverURL.length === 0}
                >
                  Connect
                </button>
                {tryConnectResponse.length > 0 ? (
                  <div className="alert alert-danger mt-3" role="alert">
                    {tryConnectResponse}
                  </div>
                ) : (
                  <></>
                )}
              </form>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
      <div className="row m-0 p-0 d-block">
        <div className="col p-2 m-0">
          <label>{status}</label>
        </div>
      </div>
    </div>
  );
}
