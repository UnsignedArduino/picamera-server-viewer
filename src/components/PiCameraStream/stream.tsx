import React from "react";
import getElement from "@/util/Element";

export default function PiCameraStream({
  wsOnMsgEventCbRef,
  hide = false,
}: {
  wsOnMsgEventCbRef: React.MutableRefObject<
    ((_e: MessageEvent) => void) | undefined
  >;
  hide: boolean;
}): JSX.Element {
  React.useEffect(() => {
    const img = getElement("stream") as HTMLImageElement;
    const imgOnLoadEvent = (e: Event) => {
      URL.revokeObjectURL((e.target as HTMLImageElement).src);
    };
    img.addEventListener("onload", imgOnLoadEvent);
    wsOnMsgEventCbRef.current = (e: MessageEvent) => {
      img.src = URL.createObjectURL(e.data);
    };
    return () => {
      img.removeEventListener("onload", imgOnLoadEvent);
    };
  }, []);

  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img id="stream" src="" alt="The PiCamera stream" hidden={hide} />
    </div>
  );
}
