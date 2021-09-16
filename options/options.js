const DEFAULT_BACKGROUND_COLOR = "#f5f0da";
const DEFAULT_FONT_COLOR = "#000000";
const DEFAULT_CIDR = "192.168.0.0/24";

const background = document.querySelector("#background-color");
const font = document.querySelector("#font-color");
const cidr = document.querySelector("#default-cidr");
const resetButton = document.querySelector("#reset");
const saveButton = document.querySelector("#save");

function saveOptions(e) {
  browser.storage.sync.set({
    background: background.value,
    font: font.value,
    cidr: cidr.value,
  });
  e.preventDefault();
}

function restoreOptions() {
  browser.storage.sync.get().then((res) => {
    console.log("Restoring... ");
    console.log(res);
    background.value = res.background || DEFAULT_BACKGROUND_COLOR;
    font.value = res.font || DEFAULT_FONT_COLOR;
    cidr.value = res.cidr || DEFAULT_CIDR;
    console.log("Restored.");
  }, onError);
}

function resetOptions() {
  browser.storage.sync.clear().then(() => {
    console.log("Values reset");
  }, onError);
}

function onError(error) {
  console.log(`Error: ${error}`);
}

saveButton.addEventListener("click", saveOptions);
resetButton.addEventListener("click", resetOptions);
document.addEventListener("DOMContentLoaded", restoreOptions);
