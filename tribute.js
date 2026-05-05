let photoDataUrl = "";

// Handle photo upload (browser-only)
document.getElementById("photoInput").addEventListener("change", function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    photoDataUrl = e.target.result;
  };
  reader.readAsDataURL(file);
});

// Switch to preview mode
function showPreview(html) {
  const frame = document.getElementById("previewFrame");
  frame.srcdoc = html;

  document.getElementById("formSection").style.display = "none";
  document.getElementById("previewSection").style.display = "block";

  window.generatedHTML = html;
}

// Go back to form
function goBack() {
  document.getElementById("previewSection").style.display = "none";
  document.getElementById("formSection").style.display = "block";
}

// Download tribute page
function downloadHTML() {
  if (!window.generatedHTML) return alert("Generate the page first!");

  const blob = new Blob([window.generatedHTML], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "tribute-page.html";
  a.click();

  URL.revokeObjectURL(url);
}

// Generate tribute page HTML
function generateTribute() {
  const name = document.getElementById("nameInput").value;
  const dates = document.getElementById("datesInput").value;
  const message = document.getElementById("messageInput").value;

  const tributeHTML = generateTemplate(name, dates, message, photoDataUrl || null);

  showPreview(tributeHTML);
}

// Tribute page template (dark candle-lit)
function generateTemplate(name, dates, message, photo) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>In Loving Memory of ${name}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">

<style>
  body {
    font-family: system-ui, sans-serif;
    background: linear-gradient(to bottom, #050509, #151520);
    color: #f5f5f5;
    padding: 16px;
    max-width: 720px;
    margin: auto;
  }

  .header-label {
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: #b3b3c2;
    font-size: clamp(0.7rem, 2vw, 0.9rem);
    text-align: center;
  }

  h1 {
    font-family: "Playfair Display", serif;
    text-align: center;
    margin: 6px 0;
    font-size: clamp(1.6rem, 5vw, 2.4rem);
  }

  .dates {
    text-align: center;
    color: #b3b3c2;
    letter-spacing: 0.16em;
    font-size: clamp(0.8rem, 2.5vw, 1rem);
  }

  .portrait {
    margin: 24px auto;
    width: min(260px, 70vw);
    height: auto;
    aspect-ratio: 3 / 4;
    border-radius: 999px;
    overflow: hidden;
    box-shadow: 0 18px 40px rgba(0,0,0,0.9);
  }

  .portrait img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .quote {
    font-size: clamp(0.95rem, 3vw, 1.1rem);
    line-height: 1.7;
    margin-top: 20px;
    text-align: center;
    padding: 0 10px;
  }

  .candle {
    margin: 40px auto;
    width: 70px;
    height: 70px;
    background: radial-gradient(circle, #fbe3a4, #f5a623 55%, transparent 70%);
    border-radius: 999px;
    box-shadow: 0 0 25px rgba(245,210,138,0.8);
    position: relative;
  }

  .flame {
    width: 16px;
    height: 28px;
    background: linear-gradient(to bottom, #fff, #f5a623 70%, #f08a1a);
    border-radius: 50%;
    position: absolute;
    top: 8px;
    left: calc(50% - 8px);
    animation: flicker 3s infinite ease-in-out;
  }

  @keyframes flicker {
    0% { transform: translateX(0); }
    50% { transform: translateX(1px); }
    100% { transform: translateX(0); }
  }
</style>
</head>

<body>

<div class="header-label">In loving memory of</div>
<h1>${name}</h1>
<div class="dates">${dates}</div>

<div class="portrait">
  ${photo ? `<img src="${photo}" alt="Portrait of ${name}">` : ""}
</div>

<div class="quote">“${message}”</div>

<div class="candle">
  <div class="flame"></div>
</div>

</body>
</html>
  `;
}
