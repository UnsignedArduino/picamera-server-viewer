import React from "react";
import { NotificationType, notify } from "@/components/Notifications";
import { dataURLToBlob } from "@/util/Blob";
import { copyPNGBlobToClipboard } from "@/util/Clipboard";
import { downloadSomething } from "@/util/Download";
import getElement from "@/util/Element";

function PiCameraSettingSelector({
  title,
  setting,
  disabled = false,
}: {
  title: string;
  setting: {
    selected: string;
    available: string[];
    default: string;
    zero_is_auto: boolean | undefined;
  };
  disabled: boolean;
}): JSX.Element {
  return (
    <div className="mb-2">
      <label className="form-label" htmlFor={title}>
        {title.replaceAll("_", " ")}:{" "}
      </label>
      <select
        className="form-select"
        name={title}
        id={title}
        defaultValue={setting.selected}
        disabled={disabled}
      >
        {setting.available.map((value) => {
          return (
            <option value={value} key={value}>
              {setting.zero_is_auto && value === "0" ? "Auto" : value}
              {value === setting.default ? " (default)" : ""}
            </option>
          );
        })}
      </select>
    </div>
  );
}

function PiCameraSettingsNumber({
  title,
  setting,
  disabled = false,
}: {
  title: string;
  setting: {
    min: number;
    max: number;
    value: number;
    default: number;
    zero_is_auto: boolean | undefined;
  };
  disabled: boolean;
}): JSX.Element {
  return (
    <div className="mb-2">
      <label className="form-label" htmlFor={title}>
        {title.replaceAll("_", " ")}:{" "}
      </label>
      <input
        className="form-control"
        type="number"
        name={title}
        id={title}
        min={setting.min}
        max={setting.max}
        defaultValue={setting.value}
        disabled={disabled}
      />
      <label className="form-text" htmlFor={title}>
        {" "}
        ({setting.min} to {setting.max}, default: {setting.default}
        {setting.zero_is_auto ? " = auto" : ""})
      </label>
    </div>
  );
}

function PiCameraSettingsNumberSlider({
  title,
  setting,
  disabled = false,
  onChange,
}: {
  title: string;
  setting: {
    min: number;
    max: number;
    value: number;
    default: number;
  };
  disabled: boolean;
  onChange: () => void;
}): JSX.Element {
  return (
    <div className="mb-2">
      <label className="form-label" htmlFor={title}>
        {title.replaceAll("_", " ")}: {setting.value}{" "}
      </label>
      <input
        className="form-range"
        type="range"
        name={title}
        id={title}
        min={setting.min}
        max={setting.max}
        defaultValue={setting.value}
        onChange={onChange}
        disabled={disabled}
      />
      <label className="form-text" htmlFor={title}>
        {" "}
        ({setting.min} to {setting.max}, default: {setting.default})
      </label>
    </div>
  );
}

export default function PiCameraControl({
  wsOnMsgEventCbRef,
  wsSendRef,
  hide = false,
}: {
  wsOnMsgEventCbRef: React.MutableRefObject<
    ((_e: MessageEvent) => void) | undefined
  >;
  wsSendRef: React.MutableRefObject<((_d: string) => void) | undefined>;
  hide: boolean;
}): JSX.Element {
  const [enableControl, setEnableControl] = React.useState(true);
  const [settings, setSettings] = React.useState<object>({});
  const [directions, setDirections] = React.useState<object>({});
  const [photo, setPhoto] = React.useState("");

  React.useEffect(() => {
    wsOnMsgEventCbRef.current = (e: MessageEvent) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "settings") {
        console.log("Received new settings");
        setSettings(msg.settings);
        setEnableControl(false);
        setTimeout(() => {
          setEnableControl(true);
        }, 100);
      } else if (msg.type === "pan_tilt") {
        console.log("Received new pan-tilt");
        setDirections(msg.pan_tilt);
      } else if (msg.type === "photo_request_result") {
        console.log("Received photo request result");
        setEnableControl(true);
        setPhoto(`data:image/png;base64,${msg.photo_request_result}`);
      }
    };
  }, [wsOnMsgEventCbRef]);

  React.useEffect(() => {
    const div = getElement("photoTakenModal") as HTMLDivElement;
    div.addEventListener("hidden.bs.modal", () => {
      setPhoto("");
    });
  }, []);

  return (
    <div
      className="px-1"
      style={{ maxHeight: "95vh", overflowY: "scroll" }}
      hidden={hide}
    >
      <h2>PiCamera Server Viewer</h2>
      <h3>Control</h3>
      <div>
        <button
          className="btn btn-primary"
          type="button"
          disabled={!enableControl}
          data-bs-toggle="modal"
          data-bs-target="#photoTakenModal"
          onClick={() => {
            console.log("Requesting photo shot");
            setEnableControl(false);
            if (wsSendRef.current != undefined) {
              wsSendRef.current(
                JSON.stringify({
                  type: "photo_request",
                }),
              );
            }
          }}
        >
          Capture photo
        </button>
        <div
          className="modal fade"
          id="photoTakenModal"
          tabIndex={-1}
          aria-labelledby="photoTakenModalTitle"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="photoTakenModalTitle">
                  Photo capture
                </h1>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {photo.length > 0 ? (
                  <>
                    <p>Photo successfully taken!</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo}
                      alt="Picture of captured image"
                      style={{
                        minWidth: "100%",
                        maxWidth: "100%",
                        minHeight: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </>
                ) : (
                  <p>Photo loading...</p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={photo.length === 0}
                  onClick={() => {
                    dataURLToBlob(photo)
                      .then((b) => {
                        return copyPNGBlobToClipboard(b);
                      })
                      .then(() => {
                        notify(
                          "Successfully copied image to clipboard!",
                          NotificationType.Success,
                        );
                      })
                      .catch(() => {
                        notify(
                          "Failed to copy image to clipboard!",
                          NotificationType.Error,
                        );
                      });
                  }}
                >
                  Copy
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={photo.length === 0}
                  onClick={() => {
                    downloadSomething(photo, "image.png");
                    notify(
                      "Successfully downloaded image!",
                      NotificationType.Success,
                    );
                  }}
                >
                  Download
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr />
      <h3>Pan-tilt control</h3>
      <div>
        {Object.keys(directions).map((key) => {
          // @ts-ignore
          const dir = directions[key];
          if (dir["value"] != undefined) {
            return (
              <PiCameraSettingsNumberSlider
                key={`${key}-${dir.value}`}
                title={key}
                setting={dir}
                disabled={!enableControl}
                onChange={() => {
                  console.log("Updating pan-tilt");
                  setEnableControl(false);
                  const newDirections = structuredClone(
                    directions as {
                      [key: string]: { [key: string]: number };
                    },
                  );
                  for (const [key, value] of Object.entries(newDirections)) {
                    if (value["value"] != undefined) {
                      const e = getElement(key) as HTMLInputElement;
                      newDirections[key]["value"] = parseInt(e.value);
                    }
                  }
                  if (wsSendRef.current != undefined) {
                    wsSendRef.current(
                      JSON.stringify({
                        type: "pan_tilt",
                        pan_tilt: newDirections,
                      }),
                    );
                  }
                }}
              />
            );
          } else {
            return <></>;
          }
        })}
      </div>
      <hr />
      <h3>Camera settings</h3>
      <div>
        <form
          onSubmit={(e) => {
            console.log("Updating settings");
            e.preventDefault();
            setEnableControl(false);
            const newSettings = structuredClone(
              settings as {
                [key: string]: { [key: string]: string | string[] | number };
              },
            );
            for (const [key, value] of Object.entries(newSettings)) {
              if (value["selected"] != undefined) {
                const e = getElement(key) as HTMLSelectElement;
                newSettings[key]["selected"] = e.options[e.selectedIndex].value
                  .replaceAll(" (default)", "")
                  .replaceAll("Auto", "0");
              } else if (value["value"] != undefined) {
                const e = getElement(key) as HTMLInputElement;
                newSettings[key]["value"] = parseInt(
                  e.value.replaceAll(" (default)", "").replaceAll("Auto", "0"),
                );
              }
            }
            if (wsSendRef.current != undefined) {
              wsSendRef.current(
                JSON.stringify({
                  type: "settings",
                  settings: newSettings,
                }),
              );
            }
          }}
        >
          {Object.keys(settings).map((key) => {
            // @ts-ignore
            const setting = settings[key];
            if (setting["selected"] != undefined) {
              return (
                <PiCameraSettingSelector
                  key={`${key}-${setting.selected}`}
                  title={key}
                  setting={setting}
                  disabled={!enableControl}
                />
              );
            } else if (setting["value"] != undefined) {
              return (
                <PiCameraSettingsNumber
                  key={`${key}-${setting.value}`}
                  title={key}
                  setting={setting}
                  disabled={!enableControl}
                />
              );
            } else {
              return <></>;
            }
          })}
          {Object.keys(settings).length > 0 ? (
            <button
              className="btn btn-primary"
              type="submit"
              disabled={!enableControl}
            >
              Update
            </button>
          ) : (
            <></>
          )}
        </form>
      </div>
    </div>
  );
}
