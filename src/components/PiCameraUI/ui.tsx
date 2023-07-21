import React from "react";
import scrypt from "scrypt-async";
import NewTabLink from "@/components/NewTabLink";
import PiCameraControl from "@/components/PiCameraControl";
import PiCameraStream from "@/components/PiCameraStream";
import WhatsThisButtonAndModal from "@/components/WhatsThis";
import { getCookie, setCookie } from "@/util/Cookies";
import getElement from "@/util/Element";

export default function PiCameraUI(): JSX.Element {
  const wsStreamRef = React.useRef<WebSocket>();
  const wsControlRef = React.useRef<WebSocket>();
  const wsStreamCbRef = React.useRef<(_e: MessageEvent) => void>();
  const wsControlCbRef = React.useRef<(_e: MessageEvent) => void>();
  const wsControlSendCbRef = React.useRef<(_d: string) => void>();
  const [status, setStatus] = React.useState("Disconnected.");
  let connectedWs = 0;
  let controlConnected = false;
  let streamConnected = false;
  const [showUI, setShowUI] = React.useState(false);
  const [disableConnectUI, setDisableConnectUI] = React.useState(false);
  const [serverURL, setServerURL] = React.useState("");
  const [serverPort, setServerPort] = React.useState<number>(NaN);
  const [serverUseSSL, setServerUseSSL] = React.useState(true);
  const [serverPassword, setServerPassword] = React.useState("");
  const [tryConnectResponse, setTryConnectResponse] = React.useState("");

  React.useEffect(() => {
    const LAST_CONN_DETAILS_COOKIE_LIFE = 60 * 60 * 24 * 400;
    if (serverURL.length > 0 && !isNaN(serverPort)) {
      setCookie("serverURL", serverURL, LAST_CONN_DETAILS_COOKIE_LIFE);
      setCookie(
        "serverPort",
        serverPort.toString(),
        LAST_CONN_DETAILS_COOKIE_LIFE,
      );
      setCookie(
        "serverUseSSL",
        serverUseSSL ? "1" : "0",
        LAST_CONN_DETAILS_COOKIE_LIFE,
      );
    }
  }, [serverPort, serverURL, serverUseSSL]);

  React.useEffect(() => {
    const url = getCookie("serverURL");
    if (url !== null) {
      console.log(`Restoring last URL: ${url}`);
      setServerURL(url);
    }
    const port = getCookie("serverPort");
    if (port !== null) {
      console.log(`Restoring last port: ${parseInt(port)}`);
      setServerPort(parseInt(port));
      (getElement("serverPortInput") as HTMLInputElement).value = port;
    }
    const useSSL = getCookie("serverUseSSL");
    if (useSSL !== null) {
      console.log(`Restoring last use SSL: ${useSSL === "1"}`);
      setServerUseSSL(useSSL === "1");
      (getElement("serverUseSSLInput") as HTMLInputElement).checked =
        useSSL === "1";
    }
  }, []);

  const disconnect = () => {
    console.log("Disconnecting all websockets");
    wsStreamRef.current?.close();
    wsControlRef.current?.close();
    connectedWs = 0;
    controlConnected = false;
    streamConnected = false;
    setShowUI(false);
    setDisableConnectUI(false);
    setStatus("Disconnected.");
    setTryConnectResponse("Disconnected.");
  };

  const connect = (
    url: string,
    password: string,
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
    let wsControlAuthed = false;
    let wsStreamAuthed = false;
    wsControl.binaryType = "blob";
    wsStream.binaryType = "blob";

    const scryptPassword = (salt: Blob): Promise<Blob> => {
      const SCRYPT_N = 2 ** 14;
      const SCRYPT_R = 8;
      const SCRYPT_P = 1;
      const SCRYPT_KEY_LEN = 64;

      return new Promise((resolve, _) => {
        salt.arrayBuffer().then((saltBuf) => {
          scrypt(
            password,
            new Uint8Array(saltBuf),
            {
              N: SCRYPT_N,
              r: SCRYPT_R,
              p: SCRYPT_P,
              dkLen: SCRYPT_KEY_LEN,
              encoding: "binary",
            },
            (result: Uint8Array) => {
              resolve(new Blob([result]));
            },
          );
        });
      });
    };

    wsControl.addEventListener("open", () => {
      console.log("Control websocket connected!");
      wsControlRef.current = wsControl;
      wsControlSendCbRef.current = (d: string) => {
        wsControl.send(d);
      };
    });
    wsStream.addEventListener("open", () => {
      console.log("Stream websocket connected!");
      wsStreamRef.current = wsStream;
    });
    wsControl.addEventListener("message", (e) => {
      if (!wsControlAuthed) {
        scryptPassword(e.data).then((result) => {
          wsControl.send(result);
        });
        wsControlAuthed = true;
        return;
      }
      if (!controlConnected) {
        connectedWs++;
        setStatus(`Connecting... (${connectedWs}/2)`);
        if (connectedWs === 2) {
          console.log("All websockets connected!");
          setStatus("Connected!");
          setShowUI(true);
        }
        controlConnected = true;
      }
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
      if (!wsStreamAuthed) {
        scryptPassword(e.data).then((result) => {
          wsStream.send(result);
        });
        wsStreamAuthed = true;
        return;
      }
      if (!streamConnected) {
        connectedWs++;
        setStatus(`Connecting... (${connectedWs}/2)`);
        if (connectedWs === 2) {
          console.log("All websockets connected!");
          setStatus("Connected!");
          setShowUI(true);
        }
        streamConnected = true;
      }
      if (wsStreamCbRef.current != null) {
        wsStreamCbRef.current(e);
      }
    });
    const wsControlCloseCb = (e: CloseEvent) => {
      console.log("Control websocket closed");
      disconnect();
      if (e.reason.length > 0) {
        console.warn(`Disconnect reason: ${e.reason}`);
        setStatus(e.reason);
        setTryConnectResponse(e.reason);
      }
    };
    wsControl.addEventListener("close", wsControlCloseCb);
    const wsStreamCloseCb = (e: CloseEvent) => {
      console.log("Control websocket closed");
      disconnect();
      if (e.reason.length > 0) {
        console.warn(`Disconnect reason: ${e.reason}`);
        setStatus(e.reason);
        setTryConnectResponse(e.reason);
      }
    };
    wsStream.addEventListener("close", wsStreamCloseCb);
    wsControl.addEventListener("error", () => {
      console.log("Control websocket closed due to error");
      wsControl.removeEventListener("close", wsControlCloseCb);
      wsStream.removeEventListener("close", wsStreamCloseCb);
      disconnect();
      setStatus("Disconnected or failed to connect!");
      setTryConnectResponse("Disconnected or failed to connect!");
    });
    wsStream.addEventListener("error", () => {
      console.log("Control websocket closed due to error");
      wsControl.removeEventListener("close", wsControlCloseCb);
      wsStream.removeEventListener("close", wsStreamCloseCb);
      disconnect();
      setStatus("Disconnected or failed to connect!");
      setTryConnectResponse("Disconnected or failed to connect!");
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
            {!showUI ? (
              <div
                className="px-1"
                style={{ maxHeight: "95vh", overflowY: "auto" }}
              >
                <h2>PiCamera Server Viewer</h2>
                <WhatsThisButtonAndModal />
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setDisableConnectUI(true);
                    const url = (
                      getElement("serverURLInput") as HTMLInputElement
                    ).value;
                    setServerURL(url);
                    const password = (
                      getElement("serverPasswordInput") as HTMLInputElement
                    ).value;
                    setServerPassword(password);
                    const port = parseInt(
                      (getElement("serverPortInput") as HTMLInputElement).value,
                    );
                    const useSSL = (
                      getElement("serverUseSSLInput") as HTMLInputElement
                    ).checked;
                    setServerPort(port);
                    setTimeout(() => {
                      connect(url, password, port, useSSL);
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
                        let url = e.target.value;
                        if (url.startsWith("https://")) {
                          url = url.replace("https://", "");
                        }
                        while (url.endsWith("/")) {
                          url = url.slice(0, url.length - 1);
                        }
                        e.target.value = url;
                        setServerURL(url);
                      }}
                      disabled={disableConnectUI}
                    />
                    <div className="form-text">
                      This is the tunnel URL or the IP address of your Raspberry
                      Pi. Input only the hostname - don{"'"}t include{" "}
                      <code>https://</code>, trailing slash, etc. For example,{" "}
                      <code>somerandomcharacters.ngrok.io</code>.
                    </div>
                  </div>
                  <div className="mb-2">
                    <label htmlFor="serverPasswordInput" className="form-label">
                      Server password:
                    </label>
                    <input
                      type="password"
                      id="serverPasswordInput"
                      autoComplete="current-password"
                      className="form-control"
                      defaultValue={serverPassword}
                      onChange={(e) => {
                        setServerPassword(e.target.value);
                      }}
                      disabled={disableConnectUI}
                    />
                    <div className="form-text">
                      Password for the Picamera server. Leave blank if not set.
                    </div>
                  </div>
                  <details className="mb-2">
                    <summary>Advanced</summary>
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
                        this empty unless you are not using a tunnel, in which
                        case it defaults to <code>4000</code> and should not be
                        changed unless you have modified the server program to
                        run on a different port.
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
                        Whether to use HTTPS or HTTP when connecting. You
                        probably want to keep this checked.
                      </div>
                    </div>
                  </details>
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
                  <div className="alert alert-primary mt-3" role="alert">
                    If you like this project, please consider ⭐ starring ⭐ or
                    contributing to the GitHub repositories for the{" "}
                    <NewTabLink href="https://github.com/UnsignedArduino/picamera-server-viewer">
                      server software
                    </NewTabLink>{" "}
                    and{" "}
                    <NewTabLink href="https://github.com/UnsignedArduino/picamera-server">
                      web page viewer
                    </NewTabLink>{" "}
                    sources!
                  </div>
                </form>
              </div>
            ) : (
              <></>
            )}
            <PiCameraControl
              wsOnMsgEventCbRef={wsControlCbRef}
              wsSendRef={wsControlSendCbRef}
              hide={!showUI}
            />
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
