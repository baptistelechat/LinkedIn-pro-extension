const actorCompanyId = "12345678";

const powerOn = "./src/images/power-on-38.png";
const powerOff = "./src/images/power-off-38.png";

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
