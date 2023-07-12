"use client";

import React from "react";
import PiCameraUI from "@/components/PiCameraUI";

export default function Home() {
  const [mount, setMount] = React.useState(false);

  React.useEffect(() => {
    setMount(true);

    return () => {
      setMount(false);
    };
  }, []);

  return <main>{mount ? <PiCameraUI /> : <></>}</main>;
}
