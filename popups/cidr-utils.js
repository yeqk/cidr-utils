const MAX_OCTET_DECIMAL = 255;
const MAX_CIDR_SUFFIX = 32;
const CSS_ERROR_CLASS = " error";

let currentParts = [0, 0, 0, 0];
let currentSuffix = 0;
let currentBin = ["00000000", "00000000", "00000000", "00000000"];

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
  });
}

suffix.addEventListener("input", (e) => {
  let value = +e.target.value.replace(/[^0-9]/g, "");
  if (value <= MAX_CIDR_SUFFIX) {
    currentSuffix = value;
  }
  e.target.value = currentSuffix;
});

for (const [i, binaryPart] of binaryParts.entries()) {
  binaryPart.addEventListener("keydown", (e) => {
    keyDownPos = window.getSelection().anchorOffset;

    if (e.key === "Backspace" && keyDownPos > 0) {
      keyDownPos -= 1;
    } else if (e.key === "1" || e.key === "0") {
      keyDownPos += 1;
    }
  });

  binaryPart.addEventListener("input", (e) => {
    console.log("inputevent");
    if (isValidOctet(e.target.innerText)) {
      removeRedBorderCss(e.target);
      let decimalValue = parseInt(e.target.innerText, 2);
      cidrParts[i].value = decimalValue;
      currentBin[i] = e.target.innerText;
    } else {
      if (!e.target.className.includes(CSS_ERROR_CLASS)) {
        applyRedBorderCss(e.target);
      }
      let value = e.target.innerText.replace(/[^0-1]/g, "");
      // Avoid the caret being moved to the left side when there is no content
      if (value.length === 0) {
        var dateSpan = document.createElement("span");
        e.target.appendChild(dateSpan);
      }
      // Cannot exceed 8 binary characters
      else if (value.length > 8) {
        e.target.innerText = currentBin[i];
        keyDownPos -= 1;
        removeRedBorderCss(e.target);
      } else {
        e.target.innerText = value;
      }
      // When change innerText, the cursor moves to the start automatically
      setCaretPosition(e.target, keyDownPos);
    }
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
  binaryParts.forEach((p) => (p.innerText = toFormattedBinary(0)));
}

function setCaretPosition(target, position) {
  var range = document.createRange();
  var sel = window.getSelection();
  console.log(target.childNodes[0]);
  if (target.childNodes[0] != undefined) {
    range.setStart(target.childNodes[0], position);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}
