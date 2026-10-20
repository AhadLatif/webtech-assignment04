// default text shown when nothing is saved
const defaultText = `# Welcome
## My first slide
Edit the markdown on the left side.

---

# Slide 2
## A list
- point one
- point two
- **bold** and *italic* text

---

# Slide 3
The end. Press Present to start!`;

let slides = [];
let current = 0;
let presenting = false;

// getting elements
const editor = document.getElementById("editor");
const previewSlide = document.getElementById("previewSlide");
const previewCount = document.getElementById("previewCount");
const presentScreen = document.getElementById("presentScreen");
const presentSlide = document.getElementById("presentSlide");
const presentCount = document.getElementById("presentCount");
const message = document.getElementById("message");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const fullBtn = document.getElementById("fullBtn");
const prevBtn2 = document.getElementById("prevBtn2");
const nextBtn2 = document.getElementById("nextBtn2");
const fullBtn2 = document.getElementById("fullBtn2");


//  markdown to html (very simple) 

function inlineFormat(text) {
  text = text.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  text = text.replace(/\*(.+?)\*/g, "<i>$1</i>");
  text = text.replace(/`(.+?)`/g, "<code>$1</code>");
  return text;
}

function markdownToHtml(md) {
  // stop html from running inside the slides
  md = md.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const lines = md.split("\n");
  let html = "";
  let inList = false;

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    // close the list if this line is not a list item
    if (inList && !line.startsWith("- ")) {
      html += "</ul>";
      inList = false;
    }

    if (line === "") {
      return;
    }

    if (line.startsWith("### ")) {
      html = html + `<h3>${inlineFormat(line.substring(4))}</h3>`;
    } else if (line.startsWith("## ")) {
      html = html + `<h2>${inlineFormat(line.substring(3))}</h2>`;
    } else if (line.startsWith("# ")) {
      html = html + `<h1>${inlineFormat(line.substring(2))}</h1>`;
    } else if (line.startsWith("- ")) {
      if (!inList) {
        html = html + "<ul>";
        inList = true;
      }
      html = html +`<li>${inlineFormat(line.substring(2))}</li>`;
    } else {
      html = html + `<p>${inlineFormat(line)}</p>`;
    }
  });

  if (inList) {
    html = html + "</ul>";
  }
  return html;
}


//  slides 

function splitSlides() {
  // split on a line that only has ---
  const parts = editor.value.split(/^---$/m);
  slides = parts.filter((part) => part.trim() !== "");

  if (slides.length === 0) {
    slides.push("");
  }
  if (current > slides.length - 1) {
    current = slides.length - 1;
  }
}

function showSlides() {
  const html = markdownToHtml(slides[current]);
  const countText = `${current + 1} / ${slides.length}`;

  previewSlide.innerHTML = html;
  presentSlide.innerHTML = html;
  previewCount.innerText = countText;
  presentCount.innerText = countText;

  // disable buttons on first and last slide
  const onFirst = current === 0;
  const onLast = current === slides.length - 1;
  prevBtn.disabled = onFirst;
  prevBtn2.disabled = onFirst;
  nextBtn.disabled = onLast;
  nextBtn2.disabled = onLast;
}

function update() {
  splitSlides();
  showSlides();
}

function goLeft() {
  if (current > 0) {
    current--;
    showSlides();
  }
}

function goRight() {
  if (current < slides.length - 1) {
    current++;
    showSlides();
  }
}


//  presentation / fullscreen 

function startPresenting() {
  presenting = true;
  presentScreen.classList.remove("hidden");
  if (presentScreen.requestFullscreen) {
    presentScreen.requestFullscreen();
  }
}

function stopPresenting() {
  presenting = false;
  presentScreen.classList.add("hidden");
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
}

function toggleFullScreen() {
  if (presenting) {
    stopPresenting();
  } else {
    startPresenting();
  }
}

// if user presses Esc the browser leaves fullscreen by itself
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement && presenting) {
    presenting = false;
    presentScreen.classList.add("hidden");
  }
});


//  saving 

function saveSlides() {
  localStorage.setItem("mySlides", editor.value);
  message.innerText = "Slides saved!";
  setTimeout(() => {
    message.innerText = "";
  }, 2000);
}

function loadSlides() {
  const saved = localStorage.getItem("mySlides");
  if (saved !== null) {
    editor.value = saved;
  } else {
    editor.value = defaultText;
  }
}

function newSlides() {
  const ok = confirm("Start a new presentation? Unsaved changes will be lost.");
  if (ok) {
    editor.value = "# New SlideWrite something here...";
    current = 0;
    update();
  }
}


//  button events 

editor.addEventListener("input", update);

document.getElementById("saveBtn").addEventListener("click", saveSlides);
document.getElementById("newBtn").addEventListener("click", newSlides);
document.getElementById("presentBtn").addEventListener("click", startPresenting);

prevBtn.addEventListener("click", goLeft);
nextBtn.addEventListener("click", goRight);
fullBtn.addEventListener("click", toggleFullScreen);
prevBtn2.addEventListener("click", goLeft);
nextBtn2.addEventListener("click", goRight);
fullBtn2.addEventListener("click", toggleFullScreen);


//  keyboard events 

document.addEventListener("keydown", (e) => {
  // Ctrl + S
  if (e.ctrlKey && e.key === "s") {
    e.preventDefault();
    saveSlides();
  }

  // F11
  if (e.key === "F11") {
    e.preventDefault();
    toggleFullScreen();
  }

  // arrow keys, but not while typing in the textarea
  if (document.activeElement !== editor) {
    if (e.key === "ArrowRight") {
      goRight();
    }
    if (e.key === "ArrowLeft") {
      goLeft();
    }
  }
});


//  start 
loadSlides();
update();
