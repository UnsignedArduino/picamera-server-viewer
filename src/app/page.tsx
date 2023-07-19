"use client";

import React from "react";
import Notifications from "@/components/Notifications";
import PiCameraUI from "@/components/PiCameraUI";

export default function Home() {
  React.useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

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
          <PiCameraUI />
          <Notifications />
        </>
      ) : (
        <></>
      )}
    </main>
  );
}
