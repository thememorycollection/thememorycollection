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
  const password = document.getElementById("passwordInput").value;

  let tributeHTML = generateTemplate(name, dates, message, photoDataUrl || null);

  if (password.trim() !== "") {
    tributeHTML = wrapEncryptedPage(tributeHTML, password);

  }

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
