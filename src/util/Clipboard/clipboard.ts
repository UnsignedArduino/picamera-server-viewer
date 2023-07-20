// https://stackoverflow.com/a/30810322/10291933
function copyToClipboardFallback(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
    } catch (err) {
      console.error("Failed to copy to clipboard: " + err);
      reject();
    }
    document.body.removeChild(textArea);
    resolve();
  });
}

export function copyTextToClipboard(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!navigator.clipboard) {
      copyToClipboardFallback(text)
        .then(() => {
          resolve();
        })
        .catch(() => {
          reject();
        });
    }
    navigator.clipboard.writeText(text).then(
      () => {
        resolve();
      },
      (err) => {
        console.error(
          "Failed to copy text to clipboard, using fallback: " + err,
        );
        copyToClipboardFallback(text)
          .then(() => {
            resolve();
          })
          .catch(() => {
            reject();
          });
      },
    );
    return true;
  });
}

export function readTextFromClipboard(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!navigator.clipboard) {
      reject();
    }
    navigator.clipboard.readText().then(
      (text) => {
        resolve(text);
      },
      (err) => {
        console.error("Failed to read from clipboard: " + err);
        reject();
      },
    );
  });
}

// https://stackoverflow.com/a/59162806/10291933
export function copyPNGBlobToClipboard(
  imgBlob: Blob
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!navigator.clipboard) {
      console.error("Clipboard API not present!")
      reject();
    }
    try {
      navigator.clipboard
        .write([new ClipboardItem({"image/png": imgBlob})])
        .then(() => {
          console.log("Successfully copied to clipboard!")
          resolve();
        })
        .catch((reason) => {
          console.error("Failed to write clipboard item!")
          console.error(reason)
          reject();
        });
    } catch (err) {
      console.error("Failed to copy image to clipboard");
      reject();
    }
  });
}
