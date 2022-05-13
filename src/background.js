const actorCompanyId = "12345678";

const powerOn = "./icons/active/active-32.png";
const powerOff = "./icons/error/error-32.png";

const setIcons = (path) => {
  chrome.action.setIcon({ path: path });
};

console.log("Service Worker Loaded 🎉");

chrome.runtime.onInstalled.addListener((reason) => {
  if (reason.reason === "install") {
    setIcons(powerOff);
    chrome.tabs.create({
      url: "./popup.html",
    });
  }
  chrome.storage.sync.set({ actorCompanyId });
  console.log(`Default actorCompanyId set to ${actorCompanyId}`);
});

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.sync.get("actorCompanyId", ({ actorCompanyId }) => {
    actorCompanyId !== "12345678" ? setIcons(powerOn) : setIcons(powerOff);
  });
});
