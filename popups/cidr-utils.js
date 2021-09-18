import * as constants from "./../defaults.js";

const MAX_OCTET_DECIMAL = 255;
const MAX_CIDR_SUFFIX = 32;
const CSS_ERROR_CLASS = " error";
const CSS_OUTRANGE_CLASS = "out-range-text";

let currentParts = [0, 0, 0, 0];
let currentSuffix = 0;
let currentBin = ["00000000", "00000000", "00000000", "00000000"];

// Length of the first span element for binaryPart that consists of 2 span
let multiPartOffset = { index: 0, offset: 0 };

let cidrParts = document.querySelectorAll("#decimal > input:not(:last-child)");
let suffix = document.querySelector("#decimal > input:last-child");
let binaryParts = document.querySelectorAll("#binary > .text");

let netmask = document.querySelector("#netmask > span");
let network = document.querySelector("#network > span");
let broadcast = document.querySelector("#broadcast > span");
let firstAddress = document.querySelector("#first-address > span");
let lastAddress = document.querySelector("#last-address > span");
let numAddresses = document.querySelector("#num-address > span");

const inputs = document.querySelectorAll("input");

let keyDownPos = 0;

initializeValues();

for (const [i, cidrPart] of cidrParts.entries()) {
  cidrPart.addEventListener("input", (e) => {
    let value = +e.target.value.replace(/[^0-9]/g, "");
    if (value <= MAX_OCTET_DECIMAL) {
      currentParts[i] = value;
    }
    e.target.value = currentParts[i];

    binaryParts[i].textContent = toFormattedBinary(+e.target.value);
    currentBin[i] = binaryParts[i].textContent;
    if (isValidOctet(binaryParts[i].innerText)) {
      removeRedBorderCss(binaryParts[i]);
    }
    setBinaryRangeColor();
    setExtraInfo();
  });
}

suffix.addEventListener("input", (e) => {
  let value = +e.target.value.replace(/[^0-9]/g, "");
  if (value <= MAX_CIDR_SUFFIX) {
    currentSuffix = value;
    setBinaryRangeColor();
  }
  e.target.value = currentSuffix;
  setExtraInfo();
});

for (const [i, binaryPart] of binaryParts.entries()) {
  binaryPart.addEventListener("keydown", (e) => {
    keyDownPos = window.getSelection().focusOffset;
    if (e.key === "Backspace" && keyDownPos > 0) {
      keyDownPos -= 1;
    } else if (e.key === "1" || e.key === "0") {
      keyDownPos += 1;
    }
    let firsSpan = window.getSelection().anchorNode.parentNode.previousSibling;
    if (firsSpan != null && firsSpan.nodeName === "SPAN") {
      // key down position relative to the div, not he span.
      keyDownPos += firsSpan.innerText.length;
    }
  });

  binaryPart.addEventListener("input", (e) => {
    let value = e.target.innerText.replace(/[^0-1]/g, "");

    if (isValidOctet(value)) {
      removeRedBorderCss(e.target);
      let decimalValue = parseInt(value, 2);
      cidrParts[i].value = decimalValue;
      currentBin[i] = value;
      e.target.textContent = value;
    } else {
      if (!e.target.className.includes(CSS_ERROR_CLASS)) {
        applyRedBorderCss(e.target);
      }
      // Avoid caret being misplaced
      if (value.length === 0) {
        e.target.innerHTML = "<br>";
      }
      // Cannot exceed 8 binary characters
      else if (value.length > 8) {
        e.target.textContent = currentBin[i];
        keyDownPos -= 1;
        removeRedBorderCss(e.target);
      } else {
        e.target.textContent = value;
      }
    }
    setBinaryRangeColor();
    // When change innerText, the cursor moves to the start automatically
    setCaretPosition(e.target, keyDownPos);
    setExtraInfo();
  });
}

function applyRedBorderCss(target) {
  target.className += CSS_ERROR_CLASS;
}

function removeRedBorderCss(target) {
  target.className = target.className.replace(CSS_ERROR_CLASS, "");
}

function isValidOctet(binOct) {
  return /^(1|0){8}$/.test(binOct);
}

function toFormattedBinary(decimalValue) {
  let binaryValue = decimalValue.toString(2);
  return "0".repeat(8).substr(binaryValue.length) + binaryValue;
}

function initializeValues() {
  cidrParts.forEach((p) => (p.value = 0));
  suffix.value = 0;
  binaryParts.forEach((p) => (p.textContent = toFormattedBinary(0)));
  setBinaryRangeColor();
  setExtraInfo();
}

//target could be a div with one span, two span or text as child.
function setCaretPosition(target, position) {
  var range = document.createRange();
  var sel = window.getSelection();
  if (target.firstChild.nodeName === "#text") {
    range.setStart(target.firstChild, position);
  } else if (
    target.childNodes.length > 1 &&
    position > multiPartOffset.offset
  ) {
    let newPos = position - multiPartOffset.offset;
    range.setStart(target.childNodes[1].firstChild, newPos);
  } else if (target.firstChild.nodeName === "SPAN") {
    range.setStart(target.firstChild.firstChild, position);
  }
  sel.removeAllRanges();
  sel.addRange(range);
}

function setBinaryRangeColor() {
  let bitsInRange = currentSuffix % 8;
  let binaryPartsInRange = Math.floor(currentSuffix / 8);

  for (let i = 0; i < binaryParts.length; i++) {
    let value = binaryParts[i].innerText;
    binaryParts[i].textContent = "";
    if (i === binaryPartsInRange) {
      let inrangePart = value.slice(0, bitsInRange);
      let outrangePart = value.slice(bitsInRange);
      let inrangeSpan = document.createElement("span");
      inrangeSpan.innerText = inrangePart;
      let outrangeSpan = document.createElement("span");
      outrangeSpan.innerText = outrangePart;
      outrangeSpan.className += CSS_OUTRANGE_CLASS;
      binaryParts[i].appendChild(inrangeSpan);
      binaryParts[i].appendChild(outrangeSpan);
      multiPartOffset.index = i;
      multiPartOffset.offset = inrangePart.length;
    } else if (i > binaryPartsInRange) {
      let valueSpan = document.createElement("span");
      valueSpan.innerText = value;
      valueSpan.className += CSS_OUTRANGE_CLASS;
      binaryParts[i].appendChild(valueSpan);
    } else {
      binaryParts[i].textContent = value;
    }
  }
}

function setExtraInfo() {
  netmask.textContent = binaryToFormattedIpString(getNetmaks());
  network.textContent = binaryToFormattedIpString(getNetwork());
  broadcast.textContent = binaryToFormattedIpString(getBoradcast());
  firstAddress.textContent = getFirstAddress();
  lastAddress.textContent = getLastAddress();
  numAddresses.textContent =
    currentSuffix > 30 ? 0 : 2 ** (32 - currentSuffix) - 2;
}

function getNetmaks() {
  return "1".repeat(currentSuffix) + "0".repeat(32 - currentSuffix);
}

function getNetwork() {
  return (
    currentBin.join("").slice(0, currentSuffix) + "0".repeat(32 - currentSuffix)
  );
}

function getBoradcast() {
  return (
    currentBin.join("").slice(0, currentSuffix) + "1".repeat(32 - currentSuffix)
  );
}

function getFirstAddress() {
  if (currentSuffix > 30) {
    return binaryToFormattedIpString("0".repeat(32));
  } else {
    let result = parseInt(getNetwork(), 2) + 1;
    return binaryToFormattedIpString(decimalToFormattedBinary(result));
  }
}

function getLastAddress() {
  if (currentSuffix > 30) {
    return binaryToFormattedIpString("0".repeat(32));
  } else {
    let result = parseInt(getBoradcast(), 2) - 1;
    return binaryToFormattedIpString(decimalToFormattedBinary(result));
  }
}

function splitArrayIntoChunksOfLen(arr, len) {
  var chunks = [],
    i = 0,
    n = arr.length;
  while (i < n) {
    chunks.push(arr.slice(i, (i += len)));
  }
  return chunks;
}

// Convert a 32 bit length binary string to formatted IP string
function binaryToFormattedIpString(binaryString) {
  return splitArrayIntoChunksOfLen(binaryString, 8)
    .map((x) => parseInt(x, 2))
    .join(".");
}

// Convert a decimal to 32 bit length binary string
function decimalToFormattedBinary(decimalNum) {
  let binaryStr = decimalNum.toString(2);
  return "0".repeat(32 - binaryStr.length).concat(binaryStr);
}

// SAVE AND RESTORE

function restoreOptions() {
  browser.storage.sync.get().then((res) => {
    document.body.style.background =
      res.background || constants.DEFAULT_BACKGROUND_COLOR;
    inputs.forEach((i) => {
      i.style.borderColor = res.font || constants.DEFAULT_FONT_COLOR;
    });
    document.body.style.color = res.font || constants.DEFAULT_FONT_COLOR;
    let cidr = res.userCidr || res.cidr || constants.DEFAULT_CIDR;
    let parts = cidr.split(/[.\/]/);
    suffix.value = parts[4];
    suffix.dispatchEvent(new Event("input"));
    for (let i = 0; i < 4; i++) {
      cidrParts[i].value = parts[i];
      cidrParts[i].dispatchEvent(new Event("input"));
    }
  }, onError);
}

function saveCidr() {
  let userCidr = currentParts.join(".");
  userCidr += "/" + currentSuffix;
  browser.storage.sync.set({ userCidr: userCidr }).then(setItem, onError);
}

restoreOptions();

let decimal = document.querySelector("#decimal");
decimal.addEventListener("change", saveCidr);
decimal.addEventListener("input", saveCidr);

function onError(error) {
  console.log(`Error: ${error}`);
}

function setItem() {
  console.log("Item saved");
}
