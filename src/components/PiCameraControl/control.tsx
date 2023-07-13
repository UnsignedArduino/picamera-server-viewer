import React from "react";
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
    <div>
      <label htmlFor={title}>{title.replaceAll("_", " ")}: </label>
      <select
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
    <div>
      <label htmlFor={title}>{title.replaceAll("_", " ")}: </label>
      <input
        type="number"
        name={title}
        id={title}
        min={setting.min}
        max={setting.max}
        defaultValue={setting.value}
        disabled={disabled}
      />
      <label htmlFor={title}>
        {" "}
        ({setting.min} to {setting.max}, default: {setting.default}
        {setting.zero_is_auto ? " = auto" : ""})
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
  const [performance, setPerformance] = React.useState<object>({});

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
      } else if (msg.type === "performance") {
        setPerformance(msg.performance);
      }
    };
  }, [wsOnMsgEventCbRef]);

  return hide ? (
    <></>
  ) : (
    <div>
      <p>{status}</p>
      <p>
        {Object.keys(performance).map((key) => {
          // @ts-ignore
          const value = performance[key];
          return (
            <>
              {key.replaceAll("_", " ")}: {value}
              <br />
            </>
          );
        })}
      </p>
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
            wsSendRef.current(JSON.stringify(newSettings));
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
          <button type="submit" disabled={!enableControl}>
            Update
          </button>
        ) : (
          <></>
        )}
      </form>
    </div>
  );
}
