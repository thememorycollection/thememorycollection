/* ---------------------------------------------------------
   GENERATE TRIBUTE (from index.html)
--------------------------------------------------------- */
function generateTribute() {
    const name = document.getElementById("nameInput").value.trim();
    const dates = document.getElementById("datesInput").value.trim();
    const message = document.getElementById("messageInput").value.trim();
    const password = document.getElementById("passwordInput").value.trim();

    const photos = window.selectedPhotos || [];

    const data = { name, dates, message, photos };

    let encrypted;

    if (password) {
        encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), password).toString();
    } else {
        encrypted = btoa(JSON.stringify(data));
    }

    window.location.href = "preview.html#" + encodeURIComponent(encrypted);
}

/* ---------------------------------------------------------
   PREVIEW PAGE INITIALISATION
--------------------------------------------------------- */
function initPreviewPage() {
    const hash = window.location.hash.substring(1);
    const encrypted = decodeURIComponent(hash);

    let data = null;

    // Try no-password first (base64)
    try {
        const json = atob(encrypted);
        data = JSON.parse(json);
        hidePasswordModal();
        showTribute(data);
        return;
    } catch (e) {}

    // Otherwise show password modal
    showPasswordModal();

    window.unlock = function () {
        let password = document.getElementById("passwordEntry").value.trim();

        const bytes = CryptoJS.AES.decrypt(encrypted, password);
        const text = bytes.toString(CryptoJS.enc.Utf8);

        if (!text) {
            alert("Incorrect password");
            return;
        }

        try {
            data = JSON.parse(text);
            hidePasswordModal();
            showTribute(data);
        } catch {
            alert("Incorrect password");
        }
    };
}

/* ---------------------------------------------------------
   VIEW PAGE INITIALISATION
--------------------------------------------------------- */
function initViewPage() {
    initPreviewPage(); // Same logic for view + preview
}

/* ---------------------------------------------------------
   PASSWORD MODAL (mobile‑safe)
--------------------------------------------------------- */
function showPasswordModal() {
    const modal = document.getElementById("passwordModal");
    modal.classList.add("show");

    // Lock background scroll
    document.body.style.overflow = "hidden";

    // Mobile Safari needs delayed focus
    setTimeout(() => {
        const input = document.getElementById("passwordEntry");
        if (input) input.focus();
    }, 300);
}

function hidePasswordModal() {
    const modal = document.getElementById("passwordModal");
    modal.classList.remove("show");

    // Restore scroll
    document.body.style.overflow = "";
}

/* ---------------------------------------------------------
   SHOW TRIBUTE (with slideshow)
--------------------------------------------------------- */
function showTribute(data) {
    document.getElementById("name").textContent = data.name || "";
    document.getElementById("dates").textContent = data.dates || "";
    document.getElementById("message").textContent = data.message || "";

    const slideshow = document.getElementById("slideshow") || document.getElementById("photos");
    if (!slideshow) return;

    slideshow.innerHTML = "";

    (data.photos || []).forEach((src, index) => {
        const slide = document.createElement("div");
        slide.className = "slide";
        if (index === 0) slide.classList.add("active");

        const img = document.createElement("img");
        img.src = src;

        slide.appendChild(img);
        slideshow.appendChild(slide);
    });

    let current = 0;
    const slides = slideshow.querySelectorAll(".slide");

    if (slides.length > 1) {
        setInterval(() => {
            slides[current].classList.remove("active");
            current = (current + 1) % slides.length;
            slides[current].classList.add("active");
        }, 5000);
    }
}

/* ---------------------------------------------------------
   PHOTO UPLOAD HANDLER (index.html)
--------------------------------------------------------- */
window.handlePhotoUpload = function (event) {
    const files = event.target.files;

    window.selectedPhotos = [];

    for (let file of files) {
        const reader = new FileReader();
        reader.onload = function (e) {
            window.selectedPhotos.push(e.target.result);
        };
        reader.readAsDataURL(file);
    }
};
