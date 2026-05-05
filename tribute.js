// -----------------------------------------------------
// 1. GENERATOR PAGE LOGIC (index.html)
// -----------------------------------------------------

function generateTribute() {
    const name = document.getElementById("nameInput").value.trim();
    const dates = document.getElementById("datesInput").value.trim();
    const message = document.getElementById("messageInput").value.trim();
    const password = document.getElementById("passwordInput").value;

    const files = document.getElementById("photoInput").files;
    const readers = [];

    // Convert uploaded photos to base64
    for (let i = 0; i < files.length; i++) {
        readers.push(new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.readAsDataURL(files[i]);
        }));
    }

    Promise.all(readers).then(photoDataUrls => {
        const tributeObj = {
            name,
            dates,
            message,
            photos: photoDataUrls
        };

        const json = JSON.stringify(tributeObj);
        let payload;

        // Encrypt if password provided
        if (password.trim() !== "") {
            payload = CryptoJS.AES.encrypt(json, password).toString();
        } else {
            payload = btoa(json);
        }

        const encoded = encodeURIComponent(payload);
        window.location.href = "preview.html#" + encoded;
    });
}



// -----------------------------------------------------
// 2. PREVIEW PAGE LOGIC (preview.html)
// -----------------------------------------------------

function initPreviewPage() {
    const hash = window.location.hash.substring(1);
    const encrypted = decodeURIComponent(hash);
    let data = null;

    // Try base64 (no password)
    try {
        const json = atob(encrypted);
        data = JSON.parse(json);
        document.getElementById("passwordModal").classList.remove("show");
        showTribute(data);
        return;
    } catch (e) {
        // Not base64 → must be AES
    }

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

    // Send-to-seller button
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



// -----------------------------------------------------
// 3. VIEW PAGE LOGIC (view.html)
// -----------------------------------------------------

function initViewPage() {
    const hash = window.location.hash.substring(1);
    const encrypted = decodeURIComponent(hash);
    let data = null;

    // Try base64 (no password)
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

    const slideshow = document.getElementById("slideshow");
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

    // Auto-play slideshow
    let current = 0;
    const slides = document.querySelectorAll(".slide");

    if (slides.length > 1) {
        setInterval(() => {
            slides[current].classList.remove("active");
            current = (current + 1) % slides.length;
            slides[current].classList.add("active");
        }, 5000); // 5 seconds per slide
    }
}
