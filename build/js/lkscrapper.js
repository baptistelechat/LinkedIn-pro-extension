const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const downloadTxtFile = (data) => {
  const element = document.createElement("a");
  const text = JSON.stringify(data)
    .replaceAll(",", " - ")
    .replaceAll('"', "")
    .replaceAll("[", "")
    .replaceAll("]", "");
  const file = new Blob([text], {
    type: "text/plain",
  });
  element.href = URL.createObjectURL(file);
  element.download = "name.txt";
  document.body.appendChild(element);
  element.click();
  element.remove();
};

const downloadCSVFile = (data) => {
  const element = document.createElement("a");
  const csv = "name;followDate;picture\n".concat(
    data
      .map(
        (subscriber) =>
          `${subscriber.name};${subscriber.followDate};${
            subscriber.picture.startsWith("data:image")
              ? "-"
              : subscriber.picture
          }`
      )
      .join("\n")
  );
  const file = new Blob([csv], {
    encoding: "UTF-8",
    type: "text/plain;charset=UTF-8",
  });
  element.href = URL.createObjectURL(file);
  element.download = "data.csv";
  document.body.appendChild(element);
  element.click();
  element.remove();
};

const handleDownloadImage = async () => {
  const zip = require("jszip")();

  const loading = await document.querySelector(".loading");
  loading.style.display = "flex";

  const cards = await document.querySelector(".download-card");
  cards.style.display = "flex";
  cards.style.flexDirection = "column";

  const preview = await document.querySelector(".Preview");
  preview.style.display = "none";

  for (let i = 0; i <= printRef.current.length - 1; i++) {
    const element = printRef.current[i];
    // element.style.transform = "scale(2)";
    const canvas = await html2canvas(element);
    const data = await canvas.toDataURL("image/jpg");
    // console.log(i, data.replace(/^data:image\/(png|jpg);base64,/, ""));
    zip.file(
      `${title(i)}.jpg`,
      data.replace(/^data:image\/(png|jpg);base64,/, ""),
      {
        base64: true,
      }
    );
  }

  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, "social.zip");
    cards.style.display = "none";
    preview.style.display = "block";
    loading.style.display = "none";
  });
};

const lkscrapper = async () => {
  // Get total subscribers
  const nbSubscribers = document
    .querySelector(".text-body-medium-bold")
    .innerHTML.replaceAll("<!---->", "")
    .replace(/\s+/g, " ");
  console.log("----------");
  console.log("👷‍♂️ Nombre Total d'abonnées :", nbSubscribers);
  console.log("----------");

  await delay(3000);
  const btn = document.querySelector(
    "#org-view-followers > table > tbody > tr:nth-child(6) > td > button"
  );
  btn.click();

  await delay(3000);
  const modal = document.querySelector(
    ".scaffold-finite-scroll.scaffold-finite-scroll--infinite.org-view-page-followers-modal__infinite-scroll-container.overflow-scroll"
  );

  const pageScroll = async () => {
    modal.scrollBy(0, 50);
    const list = document.querySelectorAll(
      ".org-view-page-followers-modal__table-row"
    );
    console.log(
      "⏳ " +
        Math.floor((list.length / parseInt(nbSubscribers)) * 100) +
        "% - " +
        list.length +
        " / " +
        nbSubscribers
    );
    if (list.length + 1 >= parseInt(nbSubscribers)) {
      const subscribers = [];
      for (let i = 0; i < list.length; i++) {
        const name = list[
          i
        ].children[0].children[0].children[0].children[1].children[0].innerHTML
          .replace(/\s+/g, " ")
          .trim();

        const picture =
          list[i].children[0].children[0].children[0].children[0].children[0]
            .src;

        const followDate = list[
          i
        ].children[1].children[0].children[0].innerHTML.replaceAll(
          "\x3C!---->",
          ""
        );

        subscribers.push({ name, picture, followDate });
      }
      console.log("----------");
      console.log("🎉 Scrapping terminé 🎉");
      console.log("----------");
      console.log(subscribers);
      console.log(subscribers.map((subscriber) => subscriber.name));
      await delay(3000);
      document.querySelector(".artdeco-modal__dismiss").click();
      await delay(3000);
      console.log("----------");
      console.log("⏳ Sauvegarde du fichier txt ⏳");
      console.log("----------");
      downloadTxtFile(subscribers.map((subscriber) => subscriber.name));
      console.log("----------");
      console.log("⏳ Sauvegarde du fichier CSV ⏳");
      console.log("----------");
      downloadCSVFile(subscribers);
    } else {
      scrolldelay = setTimeout(pageScroll, 10);
    }
  };

  pageScroll();
};

lkscrapper();
