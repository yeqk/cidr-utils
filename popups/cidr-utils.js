const MAX_OCTET_DECIMAL = 255;
const MAX_CIDR_SUFFIX = 32;
const CSS_ERROR_CLASS = " error";
const CSS_OUTRANGE_CLASS = "out-range-text";

let currentParts = [0, 0, 0, 0];
let currentSuffix = 0;
let currentBin = ["00000000", "00000000", "00000000", "00000000"];

// Length of the first span element for binaryPart that consists of 2 span
let multiPartOffset = { index: 0, offset: 0 };
let previousPos = 0;

let cidrParts = document.querySelectorAll("#decimal > input:not(:last-child)");
let suffix = document.querySelector("#decimal > input:last-child");
let binaryParts = document.querySelectorAll("#binary > .text");

let keyDownPos = 0;

initializeValues();

for (const [i, cidrPart] of cidrParts.entries()) {
  cidrPart.addEventListener("input", (e) => {
    let value = +e.target.value.replace(/[^0-9]/g, "");
    if (value <= MAX_OCTET_DECIMAL) {
      currentParts[i] = value;
    }
    e.target.value = currentParts[i];

    binaryParts[i].innerText = toFormattedBinary(+e.target.value);
    if (isValidOctet(binaryParts[i].innerText)) {
      removeRedBorderCss(binaryParts[i]);
    }
  });
}

suffix.addEventListener("input", (e) => {
  let value = +e.target.value.replace(/[^0-9]/g, "");
  if (value <= MAX_CIDR_SUFFIX) {
    currentSuffix = value;
    setBinaryRangeColor();
  }
  e.target.value = currentSuffix;
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
    if (isValidOctet(e.target.textContent)) {
      removeRedBorderCss(e.target);
      let decimalValue = parseInt(e.target.textContent, 2);
      cidrParts[i].value = decimalValue;
      currentBin[i] = e.target.textContent;
    } else {
      if (!e.target.className.includes(CSS_ERROR_CLASS)) {
        applyRedBorderCss(e.target);
      }
      let value = e.target.textContent.replace(/[^0-1]/g, "");
      // Avoid the caret being moved to the left side when there is no content
      if (value.length != 0) {
        e.target.textContent = value;
      }
      // Cannot exceed 8 binary characters
      else if (value.length > 8) {
        e.target.textContent = currentBin[i];
        keyDownPos -= 1;
        removeRedBorderCss(e.target);
      }
    }
    setBinaryRangeColor();
    // When change innerText, the cursor moves to the start automatically
    setCaretPosition(e.target, keyDownPos);
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
  return "00000000".substr(binaryValue.length) + binaryValue;
}

function initializeValues() {
  cidrParts.forEach((p) => (p.value = 0));
  suffix.value = 0;
  binaryParts.forEach((p) => (p.textContent = toFormattedBinary(0)));
  setBinaryRangeColor();
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
    console.log(target.childNodes[1].firstChild);
    let newPos = position - multiPartOffset.offset;
    console.log(newPos);
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
