function PiCameraSettingSelector({
  title,
  setting,
}: {
  title: string;
  setting: { selected: string; available: string[] };
}): JSX.Element {
  return (
    <div>
      <label>{title.replaceAll("_", " ")}: </label>
      <select>
        {setting.available.map((value) => {
          return (
            <option
              value={value}
              key={value}
              selected={setting.selected === value}
            >
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
      <label>{title.replaceAll("_", " ")}: </label>
      <input
        type="number"
        min={setting.min}
        max={setting.max}
        defaultValue={setting.value}
      />
    </div>
  );
}

export default function PiCameraSettings({
  settings,
}: {
  settings: object;
}): JSX.Element {
  return (
    <div>
      {Object.keys(settings).map((key) => {
        // @ts-ignore
        const setting = settings[key];
        if (setting["selected"] != undefined) {
          return (
            <PiCameraSettingSelector key={key} title={key} setting={setting} />
          );
        } else if (setting["min"] != undefined) {
          return (
            <PiCameraSettingsNumber key={key} title={key} setting={setting} />
          );
        } else {
          return <></>;
        }
      })}
    </div>
  );
}
