export default function getElement(id: string): HTMLElement {
  const e = document.getElementById(id);
  if (e != null) {
    return e;
  } else {
    throw new Error("Cannot obtain element!");
  }
}
