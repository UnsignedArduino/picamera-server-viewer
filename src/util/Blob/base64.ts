export default function blobToBase64(b: Blob): Promise<string> {
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
