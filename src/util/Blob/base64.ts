export function blobToBase64(b: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const r = reader.result;
      if (r == null || r instanceof ArrayBuffer) {
        reject();
      } else {
        resolve(r);
      }
    };
    reader.readAsDataURL(b);
  });
}

export function dataURLToBlob(dataURL: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    fetch(dataURL)
      .then((result) => {
        result
          .blob()
          .then((b) => {
            resolve(b);
          })
          .catch(() => {
            reject();
          });
      })
      .catch(() => {
        reject();
      });
  });
}
