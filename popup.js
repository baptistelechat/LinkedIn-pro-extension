const admin = document.getElementById("goToAdminPage");
const openWithLkPersoPage = document.getElementById("openWithLkPersoPage");
const openWithLkProPage = document.getElementById("openWithLkProPage");
const currentActorCompanyId = document.getElementById("currentActorCompanyId");
const input = document.getElementById("actorCompanyIdInput");
const submit = document.getElementById("actorCompanyIdSubmit");

const active = {
  16: "./src/images/active/active-16.png",
  32: "./src/images/active/active-32.png",
  48: "./src/images/active/active-48.png",
  128: "./src/images/active/active-128.png",
};
activeNotification = "./src/images/active/active.png";

const error = {
  16: "./src/images/error/error-16.png",
  32: "./src/images/error/error-32.png",
  48: "./src/images/error/error-48.png",
  128: "./src/images/error/error-128.png",
};
errorNotification = "./src/images/error/error.png";

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
    } else if (tab.url.includes("?actorCompanyId=")) {
      openWithLkProPage.classList.add("disabled");
      openWithLkPersoPage.classList.remove("disabled");
    } else if (
      tab.url.includes(
        "/?utm_source=linkedin_share&utm_medium=member_desktop_web"
      )
    ) {
      openWithLkProPage.classList.remove("disabled");
      openWithLkPersoPage.classList.add("disabled");
    } else {
      openWithLkProPage.classList.add("disabled");
      openWithLkPersoPage.classList.add("disabled");
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
      const newUrl = `${url}/?utm_source=linkedin_share&utm_medium=member_desktop_web`;
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
