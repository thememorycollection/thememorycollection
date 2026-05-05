// -----------------------------
// Shared tribute functions
// -----------------------------

// Read encrypted payload from URL
function getEncryptedPayload() {
    const hash = window.location.hash.substring(1);
    return decodeURIComponent(hash);
}

// Try to decode without password (base64)
function tryBase64Decode(encrypted) {
    try {
        const json = atob(encrypted);
        return JSON.parse(json);
    } catch {
        return null;
    }
}

// Try to decrypt with password (AES)
function tryPasswordDecrypt(encrypted, password) {
    try {
        const bytes = CryptoJS.AES.decrypt(encrypted, password);
        const text = bytes.toString(CryptoJS.enc.Utf8);
        if (!text) return null;
        return JSON.parse(text);
    } catch {
        return null;
    }
}

// Render tribute content
function showTribute(data) {
    document.getElementById("name").textContent = data.name || "";
    document.getElementById("dates").textContent = data.dates || "";
    document.getElementById("message").textContent = data.message || "";

    const container = document.getElementById("photos");
    container.innerHTML = "";

    (data.photos || []).forEach(src => {
        const img = document.createElement("img");
        img.src = src;
        img.className = "tribute-photo";
        container.appendChild(img);
    });
}

// -----------------------------
// Page-specific logic
// -----------------------------

// Called on preview.html and view.html
function initTributePage(isPreviewPage = false) {
    const encrypted = getEncryptedPayload();

    // 1. Try base64 (no password)
    const noPasswordData = tryBase64Decode(encrypted);

    if (noPasswordData) {
        document.getElementById("passwordModal").classList.remove("show");
        showTribute(noPasswordData);
        return;
    }

    // 2. Otherwise show modal
    document.getElementById("passwordModal").classList.add("show");

    // Unlock handler
    window.unlock = function () {
        const password = document.getElementById("passwordEntry").value;
        const decrypted = tryPasswordDecrypt(encrypted, password);

        if (!decrypted) {
            alert("Incorrect password");
            return;
        }

        document.getElementById("passwordModal").classList.remove("show");
        showTribute(decrypted);
    };

    // Preview page only: send-to-seller button
    if (isPreviewPage) {
        window.sendToSeller = function () {
            const link = window.location.origin +
                window.location.pathname.replace("preview.html", "view.html") +
                "#" + encodeURIComponent(encrypted);

            const subject = encodeURIComponent("New Tribute Page – TheMemoryCollection");
            const body = encodeURIComponent(
                "A new tribute page has been created.\n\n" +
                "Link:\n" + link + "\n\n" +
                "(Use this link to generate the QR code for the keepsake.)"
            );

            window.location.href = "mailto:you@example.com?subject=" + subject + "&body=" + body;
        };
    }
}

// -----------------------------
// Generator page logic (index.html)
// -----------------------------

function generateTribute() {
  const name = document.getElementById("nameInput").value.trim();
  const dates = document.getElementById("datesInput").value.trim();
  const message = document.getElementById("messageInput").value.trim();
  const password = document.getElementById("passwordInput").value;

  const files = document.getElementById("photoInput").files;
  const readers = [];

  for (let i = 0; i < files.length; i++) {
    readers.push(new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsDataURL(files[i]);
    }));
  }

  Promise.all(readers).then(photoDataUrls => {
    const tributeObj = { name, dates, message, photos: photoDataUrls };
    const json = JSON.stringify(tributeObj);

    let payload;
    if (password.trim() !== "") {
      // AES encrypt with password
      payload = CryptoJS.AES.encrypt(json, password).toString();
    } else {
      // Plain base64
      payload = btoa(json);
    }

    const encoded = encodeURIComponent(payload);
    window.location.href = "preview.html#" + encoded;
  });
}
