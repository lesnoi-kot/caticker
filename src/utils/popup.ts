export function newWindow(url: string) {
  const popupWindow = window.open(url, "_blank");

  if (popupWindow === null) {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.click();
  }
}

export function downloadURL(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.target = "_self";
  a.click();
}
