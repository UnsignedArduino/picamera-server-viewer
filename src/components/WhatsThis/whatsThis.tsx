import React from "react";
import NewTabLink from "@/components/NewTabLink";

export default function WhatsThisButtonAndModal(): JSX.Element {
  return (
    <>
      <button
        className="btn btn-link p-0"
        type="button"
        data-bs-toggle="modal"
        data-bs-target="#whatIsThisModal"
      >
        What{"'"}s this?
      </button>
      <div
        className="modal fade"
        id="whatIsThisModal"
        tabIndex={-1}
        aria-labelledby="whatIsThisModalTitle"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="whatIsThisModalTitle">
                What{"'"}s this?
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p>
                This web page is the viewer for the{" "}
                <NewTabLink href="https://github.com/UnsignedArduino/picamera-server">
                  Picamera server
                </NewTabLink>
                , which is software that runs on the Raspberry Pi. This allows
                you to stream and control a Picamera that is connected to the
                Pi. It also supports the Waveshare Pan-tilt HAT, which allows
                you to change the direction the camera is facing!
              </p>
              <p>
                To install the streaming software, follow the installation
                instructions provided in the{" "}
                <NewTabLink href="https://github.com/UnsignedArduino/picamera-server/blob/main/README.md#install">
                  GitHub repository
                </NewTabLink>
                .
              </p>
              <p>
                Issues? Post an issue in the respective GitHub repositories for
                either the{" "}
                <NewTabLink href="https://github.com/UnsignedArduino/picamera-server">
                  server software
                </NewTabLink>{" "}
                or{" "}
                <NewTabLink href="https://github.com/UnsignedArduino/picamera-server-viewer">
                  web page viewer
                </NewTabLink>
                !
              </p>
            </div>
            <div className="modal-footer">
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
    </>
  );
}
