"use client";

import React from "react";
import PiCameraControl from "@/components/PiCameraControl";
import PiCameraStream from "@/components/PiCameraStream";

export default function Home() {
  const [mount, setMount] = React.useState(false);

  React.useEffect(() => {
    setMount(true);

    return () => {
      setMount(false);
    };
  }, []);

  return (
    <main>
      {mount ? (
        <>
          <PiCameraStream />
          <br />
          <PiCameraControl />
        </>
      ) : (
        <></>
      )}
    </main>
  );
}
