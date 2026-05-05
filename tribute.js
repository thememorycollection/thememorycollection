
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
