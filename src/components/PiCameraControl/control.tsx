import React from "react";
import getElement from "@/util/Element";

function PiCameraSettingSelector({
  title,
  setting,
}: {
  title: string;
  setting: { selected: string; available: string[] };
}): JSX.Element {
  return (
    <div>
      <label htmlFor={title}>{title.replaceAll("_", " ")}: </label>
      <select name={title} id={title} defaultValue={setting.selected}>
        {setting.available.map((value) => {
          return (
            <option value={value} key={value}>
              {value}
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
}: {
  title: string;
  setting: { min: number; max: number; value: number };
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
      />
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
  const [settings, setSettings] = React.useState<object>({});
  const [performance, setPerformance] = React.useState<object>({});

  React.useEffect(() => {
    wsOnMsgEventCbRef.current = (e: MessageEvent) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "settings") {
        console.log("Received new settings");
        setSettings(msg.settings);
      } else if (msg.type === "performance") {
        setPerformance(msg.performance);
      }
    };
  }, []);

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
          const newSettings = structuredClone(
            settings as {
              [key: string]: { [key: string]: string | string[] | number };
            },
          );
          for (const [key, value] of Object.entries(newSettings)) {
            if (value["selected"] != undefined) {
              const e = getElement(key) as HTMLSelectElement;
              newSettings[key]["selected"] = e.options[e.selectedIndex].value;
            } else if (value["value"] != undefined) {
              const e = getElement(key) as HTMLInputElement;
              newSettings[key]["value"] = parseInt(e.value);
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
              />
            );
          } else if (setting["value"] != undefined) {
            return (
              <PiCameraSettingsNumber
                key={`${key}-${setting.value}`}
                title={key}
                setting={setting}
              />
            );
          } else {
            return <></>;
          }
        })}
        {Object.keys(settings).length > 0 ? (
          <button type="submit">Update</button>
        ) : (
          <></>
        )}
      </form>
    </div>
  );
}
