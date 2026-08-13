export function registerServiceWorker() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator && process.env.NODE_ENV === "production") {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("FarmHand ServiceWorker registered successfully:", reg.scope)
        })
        .catch((err) => {
          console.warn("FarmHand ServiceWorker registration failed:", err)
        })
    })
  }
}
