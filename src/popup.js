import { lkscrapper } from "../public/js/lkscrapper";

const admin = document.getElementById("goToAdminPage");
const openWithLkPersoPage = document.getElementById("openWithLkPersoPage");
const openWithLkProPage = document.getElementById("openWithLkProPage");
const currentActorCompanyId = document.getElementById("currentActorCompanyId");
const input = document.getElementById("actorCompanyIdInput");
const submit = document.getElementById("actorCompanyIdSubmit");
const exportSubscribers = document.getElementById("exportSubscribers");
const inputMarginSubscriber = document.getElementById("marginSubscriberInput");

const active = {
  16: "./icons/active/active-16.png",
  32: "./icons/active/active-32.png",
  48: "./icons/active/active-48.png",
  128: "./icons/active/active-128.png",
};
const activeNotification = "./icons/active/active-32.png";

const error = {
  16: "./icons/error/error-16.png",
  32: "./icons/error/error-32.png",
  48: "./icons/error/error-48.png",
  128: "./icons/error/error-128.png",
};
const errorNotification = "./icons/error/error-32.png";

const setIcons = (img) => {
  chrome.action.setIcon({ path: img });
};

const isLinkedInProPage = async () => {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  chrome.storage.sync.get("actorCompanyId", ({ actorCompanyId }) => {
    if (
      actorCompanyId === "12345678" ||
      !tab.url.includes("https://www.linkedin.com/")
    ) {
      openWithLkProPage.classList.add("disabled");
      openWithLkPersoPage.classList.add("disabled");
      exportSubscribers.classList.add("disabled");
    } else if (tab.url.includes("?actorCompanyId=")) {
      openWithLkProPage.classList.add("disabled");
      openWithLkPersoPage.classList.remove("disabled");
      exportSubscribers.classList.add("disabled");
    } else if (
      tab.url.includes(
        "/?utm_source=linkedin_share&utm_medium=member_desktop_web"
      ) ||
      tab.url.includes("/feed/update/urn:li:activity:")
    ) {
      openWithLkProPage.classList.remove("disabled");
      openWithLkPersoPage.classList.add("disabled");
      exportSubscribers.classList.add("disabled");
    } else if (tab.url.includes("/admin/analytics/followers")) {
      openWithLkProPage.classList.add("disabled");
      openWithLkPersoPage.classList.add("disabled");
      exportSubscribers.classList.remove("disabled");
    } else {
      openWithLkProPage.classList.add("disabled");
      openWithLkPersoPage.classList.add("disabled");
      exportSubscribers.classList.add("disabled");
    }
  });
};

admin.addEventListener("click", () => {
  chrome.storage.sync.get("actorCompanyId", ({ actorCompanyId }) => {
    chrome.tabs.create({
      url: `https://www.linkedin.com/company/${actorCompanyId}/admin/`,
    });
  });
});

openWithLkProPage.addEventListener("click", async () => {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  const id = tab.id;
  const url = tab.url.split(
    "/?utm_source=linkedin_share&utm_medium=member_desktop_web"
  )[0];
  chrome.storage.sync.get("actorCompanyId", ({ actorCompanyId }) => {
    chrome.tabs.get(id, async (tab) => {
      const newUrl = `${url}?actorCompanyId=${actorCompanyId}`;
      chrome.tabs.update(id, { url: newUrl });
    });
    openWithLkProPage.classList.add("disabled");
    openWithLkPersoPage.classList.remove("disabled");
  });
});

openWithLkPersoPage.addEventListener("click", async () => {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  const id = tab.id;
  const url = tab.url.split("?actorCompanyId=")[0];
  chrome.storage.sync.get("actorCompanyId", ({ actorCompanyId }) => {
    chrome.tabs.get(id, async (tab) => {
      const newUrl = tab.url.includes("/feed/update/urn:li:activity:")
        ? url
        : `${url}/?utm_source=linkedin_share&utm_medium=member_desktop_web`;
      chrome.tabs.update(id, { url: newUrl });
    });
    openWithLkProPage.classList.remove("disabled");
    openWithLkPersoPage.classList.add("disabled");
  });
});

submit.addEventListener("click", () => {
  if (input.value.length === 8) {
    setIcons(active);
    admin.classList.remove("disabled");
    isLinkedInProPage();
    const actorCompanyId = input.value;
    chrome.storage.sync.set({ actorCompanyId });
    currentActorCompanyId.innerText = "Identifiant actuel : " + actorCompanyId;
    console.log(`actorCompanyId set to ${actorCompanyId}`);
    chrome.notifications.create({
      type: "basic",
      iconUrl: activeNotification,
      title: "LinkedIn Pro Extension",
      message: "actorCompanyId enregistré : " + input.value,
    });
    input.value = "";
  } else if (input.value.length > 8) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: errorNotification,
      title: "LinkedIn Pro Extension",
      message:
        "actorCompanyId trop long : " +
        input.value +
        " (8 caractères attendus)",
    });
  } else if (input.value.length < 8) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: errorNotification,
      title: "LinkedIn Pro Extension",
      message:
        "actorCompanyId trop court : " +
        input.value +
        " (8 caractères attendus)",
    });
  }
});

chrome.notifications.onClicked.addListener(() => {
  chrome.storage.sync.get("actorCompanyId", ({ actorCompanyId }) => {
    if (actorCompanyId !== "12345678") {
      chrome.tabs.create({
        url: `https://www.linkedin.com/company/${actorCompanyId}/admin/`,
      });
    }
  });
});

exportSubscribers.addEventListener("click", async () => {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  const id = tab.id;
  console.log("exportSubscribers");
  chrome.scripting.executeScript({
    target: { tabId: id, allFrames: true },
    files: ["./js/lkscrapper.js"],
  });
});

inputMarginSubscriber.addEventListener("change", () => {
  const marginSubscriber = inputMarginSubscriber.value;
  chrome.storage.sync.set({ marginSubscriber });
});

chrome.storage.sync.get("actorCompanyId", ({ actorCompanyId }) => {
  actorCompanyId !== "12345678" ? setIcons(active) : setIcons(error);
  currentActorCompanyId.innerText = "Identifiant actuel : " + actorCompanyId;
  if (actorCompanyId !== "12345678") {
    admin.classList.remove("disabled");
    openWithLkProPage.classList.remove("disabled");
  } else {
    admin.classList.add("disabled");
    openWithLkProPage.classList.add("disabled");
  }
});

isLinkedInProPage();
