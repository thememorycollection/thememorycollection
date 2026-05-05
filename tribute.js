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
<!-- PREVIEW SECTION -->
<div id="previewSection">
  <h2>Preview of Tribute Page</h2>
  <iframe id="previewFrame"></iframe>

  <button onclick="goBack()">Back to Form</button>
  <button onclick="downloadHTML()">Buy Now</button>
</div>

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

  let tributeHTML = generateTemplate(name, dates, message, photoDataUrl || null);
  tributeHTML = tributeHTML.replace("{{RETURN_URL}}", window.lastTributeURL);

  if (password.trim() !== "") {
    tributeHTML = wrapEncryptedPage(tributeHTML, password);

  }
const returnURL = encodeURIComponent(window.location.href);
tributeHTML = tributeHTML.replace("{{RETURN_URL}}", returnURL);
  showPreview(tributeHTML);
}

// Tribute page template (dark candle-lit)
function wrapEncryptedPage(html, password) {
  const encrypted = CryptoJS.AES.encrypt(html, password).toString();

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Protected Tribute Page</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>

<style>
  body {
    font-family: system-ui, sans-serif;
    background: #0b0b10;
    color: #eee;
    padding: 20px;
    text-align: center;
  }
  input {
    padding: 12px;
    width: 80%;
    max-width: 260px;
    margin-top: 20px;
    border-radius: 6px;
    border: 1px solid #333;
    background: #1a1a22;
    color: #eee;
  }
  button {
    margin-top: 20px;
    padding: 12px 18px;
    background: #f5d28a;
    color: #000;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
  }
</style>

</head>
<body>

<h2>This tribute page is protected</h2>
<p>Please enter the password to view it.</p>

<input id="pw" type="password" placeholder="Password">
<button onclick="unlock()">Unlock</button>

<script>
  const encrypted = "${encrypted}";

  function unlock() {
    const pw = document.getElementById('pw').value;
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, pw);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (!decrypted) {
        alert("Incorrect password");
        return;
      }

      document.open();
      document.write(decrypted);
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
  .portrait {
    margin: 30px auto;
    width: 260px;
    height: 340px;
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

<div class="portrait">
  ${photo ? `<img src="${photo}" alt="Portrait of ${name}">` : ""}
</div>

<div class="quote">“${message}”</div>

<div class="candle">
  <div class="flame"></div>
</div>

<div style="text-align:center; margin-top:30px;">
  <a href="slideshow.html?return={{RETURN_URL}}"
   style="
     display:inline-block;
     padding:12px 20px;
     background:#f5d28a;
     color:#000;
     text-decoration:none;
     border-radius:8px;
     font-weight:600;
     font-size:1rem;
   ">
   View Tribute Slideshow
</a>
</div>

</body>
</html>
  `;
}
