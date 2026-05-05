// -----------------------------------------------------
// 1. GENERATOR PAGE LOGIC (index.html)
// -----------------------------------------------------

function generateTribute() {
  // your generate code here
}



// -----------------------------------------------------
// 2. PREVIEW PAGE LOGIC (preview.html)
// -----------------------------------------------------

function initPreviewPage() {
  const hash = window.location.hash.substring(1);
  const encrypted = decodeURIComponent(hash);
  let data = null;

  // Try no-password first (base64)
  try {
    const json = atob(encrypted);
    data = JSON.parse(json);
    document.getElementById("passwordModal").classList.remove("show");
    showTribute(data);
    return;
  } catch (e) {
    // fall through to password flow
  }

  // Show modal if base64 failed
  document.getElementById("passwordModal").classList.add("show");

  window.unlock = function () {
    const password = document.getElementById("passwordEntry").value;
    const bytes = CryptoJS.AES.decrypt(encrypted, password);
    const text = bytes.toString(CryptoJS.enc.Utf8);

    if (!text) {
      alert("Incorrect password");
      return;
    }

    try {
      data = JSON.parse(text);
      document.getElementById("passwordModal").classList.remove("show");
      showTribute(data);
    } catch {
      alert("Incorrect password");
    }
  };
}



// -----------------------------------------------------
// 3. VIEW PAGE LOGIC (view.html)
// -----------------------------------------------------

function initViewPage() {
  const hash = window.location.hash.substring(1);
  const encrypted = decodeURIComponent(hash);
  let data = null;

  // Try no-password first (base64)
  try {
    const json = atob(encrypted);
    data = JSON.parse(json);
    document.getElementById("passwordModal").classList.remove("show");
    showTribute(data);
    return;
  } catch (e) {}

  // Show modal
  document.getElementById("passwordModal").classList.add("show");

  window.unlock = function () {
    const password = document.getElementById("passwordEntry").value;
    const bytes = CryptoJS.AES.decrypt(encrypted, password);
    const text = bytes.toString(CryptoJS.enc.Utf8);

    if (!text) {
      alert("Incorrect password");
      return;
    }

    try {
      data = JSON.parse(text);
      document.getElementById("passwordModal").classList.remove("show");
      showTribute(data);
    } catch {
      alert("Incorrect password");
    }
  };
}



// -----------------------------------------------------
// 4. SHARED RENDERING FUNCTION
// -----------------------------------------------------

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
