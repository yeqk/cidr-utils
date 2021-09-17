import * as constants from "./../defaults.js";

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
    background.value = res.background || constants.DEFAULT_BACKGROUND_COLOR;
    font.value = res.font || constants.DEFAULT_FONT_COLOR;
    cidr.value = res.cidr || constants.DEFAULT_CIDR;
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
