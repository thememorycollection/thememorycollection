let photoDataUrls = [];

// Handle multi‑photo upload (browser‑only)
document.getElementById("photoInput").addEventListener("change", function(event) {
  const files = event.target.files;
  photoDataUrls = []; // reset

  if (!files.length) return;

  [...files].forEach(file => {
    const reader = new FileReader();
    reader.onload = e => photoDataUrls.push(e.target.result);
    reader.readAsDataURL(file);
  });
});

// Encrypt tribute HTML using password
async function encryptText(text, password) {
  const enc = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("returning-hearts-salt"),
      iterations: 120000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(text)
  );

  return {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encrypted))
  };
}

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
  const password = document.getElementById("passwordInput").value;

  const photos = [];  
  const files = document.getElementById("photoInput").files;

  const readerPromises = [...files].map(file => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  });

  Promise.all(readerPromises).then(results => {
    const tributeData = JSON.stringify({
      name,
      dates,
      message,
      photos: results
    });

    let encrypted;

    if (password.trim() !== "") {
      encrypted = CryptoJS.AES.encrypt(tributeData, password).toString();
    } else {
      encrypted = btoa(tributeData);
    }

    window.location.href = "preview.html#" + encodeURIComponent(encrypted);
  });
}

// Locked tribute page template
function generateLockedPage(encrypted) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Protected Tribute</title>
<meta name="viewport" content="width=device-width, initial-scale=1">

<style>
  body {
    font-family: system-ui, sans-serif;
    background: linear-gradient(to bottom, #050509, #151520);
    color: #f5f5f5;
    padding: 40px 20px;
    max-width: 720px;
    margin: auto;
    text-align: center;
  }

  h2 {
    font-family: "Playfair Display", serif;
    margin-bottom: 10px;
  }

  p {
    color: #b3b3c2;
    letter-spacing: 0.05em;
    margin-bottom: 30px;
  }

  input {
    width: 80%;
    max-width: 260px;
    padding: 12px;
    border-radius: 8px;
    border: none;
    outline: none;
    background: rgba(255,255,255,0.08);
    color: #fff;
    font-size: 1rem;
    text-align: center;
    box-shadow: 0 0 12px rgba(0,0,0,0.4) inset;
  }

  input::placeholder {
    color: #aaa;
  }

  button {
    margin-top: 25px;
    padding: 12px 26px;
    border-radius: 8px;
    border: none;
    background: #f5a623;
    color: #000;
    font-weight: bold;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 0 0 18px rgba(245,166,35,0.5);
    transition: 0.2s ease;
  }

  button:hover {
    background: #ffb948;
    box-shadow: 0 0 25px rgba(245,166,35,0.7);
  }

  .candle-glow {
    width: 90px;
    height: 90px;
    margin: 40px auto 0;
    background: radial-gradient(circle, #fbe3a4, #f5a623 55%, transparent 70%);
    border-radius: 999px;
    box-shadow: 0 0 25px rgba(245,210,138,0.8);
  }
</style>
</head>

<body>

<h2>This tribute is password protected</h2>
<p>Please enter the password to continue</p>

<input id="pw" type="password" placeholder="Password">
<br>
<button onclick="unlock()">Unlock Tribute</button>

<div class="candle-glow"></div>

<script>
  const encrypted = ${JSON.stringify(encrypted)};

  async function unlock() {
    const password = document.getElementById("pw").value;
    const enc = new TextEncoder();

    try {
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
      );

      const key = await crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: enc.encode("returning-hearts-salt"),
          iterations: 120000,
          hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
      );

      const iv = new Uint8Array(encrypted.iv);
      const data = new Uint8Array(encrypted.data);

      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        data
      );

      const html = new TextDecoder().decode(decrypted);
      document.open();
      document.write(html);
      document.close();

    } catch (e) {
      alert("Incorrect password");
    }
  }
</script>

</body>
</html>
  `;
}

// Tribute page template (dark candle-lit) with slideshow
function generateTemplate(name, dates, message, photos) {

  // Build slideshow HTML
  let slideshowHTML = "";
  if (photos && photos.length > 0) {
    photos.forEach((src, i) => {
      slideshowHTML += `
        <div class="slide ${i === 0 ? "active" : ""}">
          <img src="${src}" alt="Photo of ${name}">
        </div>`;
    });
  }

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
    padding: 20px;
    max-width: 720px;
    margin: auto;
  }
  .header-label {
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: #b3b3c2;
    font-size: 0.8rem;
    text-align: center;
  }
  h1 {
    font-family: "Playfair Display", serif;
    text-align: center;
    margin: 6px 0;
  }
  .dates {
    text-align: center;
    color: #b3b3c2;
    letter-spacing: 0.16em;
  }

  .slideshow {
    position: relative;
    width: 260px;
    height: 340px;
    margin: 30px auto;
    border-radius: 999px;
    overflow: hidden;
    box-shadow: 0 18px 40px rgba(0,0,0,0.9);
  }

  .slide {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 1.3s ease-in-out;
  }

  .slide img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .slide.active {
    opacity: 1;
  }

  .quote {
    font-size: 1rem;
    line-height: 1.7;
    margin-top: 20px;
    text-align: center;
  }
  .candle {
    margin: 40px auto;
    width: 80px;
    height: 80px;
    background: radial-gradient(circle, #fbe3a4, #f5a623 55%, transparent 70%);
    border-radius: 999px;
    box-shadow: 0 0 25px rgba(245,210,138,0.8);
    position: relative;
  }
  .flame {
    width: 18px;
    height: 32px;
    background: linear-gradient(to bottom, #fff, #f5a623 70%, #f08a1a);
    border-radius: 50%;
    position: absolute;
    top: 10px;
    left: 31px;
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

${photos.length > 0 ? `
<div class="slideshow">
  ${slideshowHTML}
</div>
` : ""}

<div class="quote">“${message}”</div>

<div class="candle">
  <div class="flame"></div>
</div>

<script>
  let index = 0;
  const slides = document.querySelectorAll('.slide');

  function showSlide() {
    slides.forEach(s => s.classList.remove('active'));
    slides[index].classList.add('active');
    index = (index + 1) % slides.length;
  }

  if (slides.length > 1) {
    setInterval(showSlide, 5000);
  }
</script>

</body>
</html>
  `;
}
