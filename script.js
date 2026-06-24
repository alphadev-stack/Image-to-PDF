// ======================================
// AlphaDev Stack - Image to PDF
// ======================================

// Elements
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const convertBtn = document.getElementById("convertBtn");

const pageSize = document.getElementById("pageSize");
const fitMode = document.getElementById("fitMode");

const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

const uploadBox = document.querySelector(".uploadBox");
const themeToggle = document.getElementById("themeToggle");

// Store uploaded images
let images = [];

// ===============================
// Upload Images
// ===============================

imageInput.addEventListener("change", (e) => {

    const files = Array.from(e.target.files);

    images.push(...files);

    renderImages();

});

// ===============================
// Render Preview
// ===============================

function renderImages() {

    preview.innerHTML = "";

    images.forEach((file, index) => {

        const reader = new FileReader();

        reader.onload = (e) => {

            const card = document.createElement("div");

            card.className = "imageCard";

            card.innerHTML = `

            <button class="removeBtn" data-index="${index}">

                <i class="fa-solid fa-xmark"></i>

            </button>

            <img src="${e.target.result}">

            <p class="imageName">${file.name}</p>

            `;

            preview.appendChild(card);

        };

        reader.readAsDataURL(file);

    });

}

// ===============================
// Delete Image
// ===============================

preview.addEventListener("click", (e) => {

    const btn = e.target.closest(".removeBtn");

    if (!btn) return;

    const index = Number(btn.dataset.index);

    images.splice(index, 1);

    renderImages();

});

// ===============================
// Read Image
// ===============================

function readFile(file) {

    return new Promise((resolve) => {

        const reader = new FileReader();

        reader.onload = (e) => resolve(e.target.result);

        reader.readAsDataURL(file);

    });

}
// ======================================
// PART 2
// Drag & Drop Upload
// ======================================

["dragenter", "dragover"].forEach(event => {

    uploadBox.addEventListener(event, (e) => {

        e.preventDefault();

        uploadBox.classList.add("drag");

    });

});

["dragleave", "drop"].forEach(event => {

    uploadBox.addEventListener(event, (e) => {

        e.preventDefault();

        uploadBox.classList.remove("drag");

    });

});

uploadBox.addEventListener("drop", (e) => {

    const files = Array.from(e.dataTransfer.files);

    const imageFiles = files.filter(file =>
        file.type.startsWith("image/")
    );

    images.push(...imageFiles);

    renderImages();

});

// ======================================
// Dark / Light Mode
// ======================================

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("light");

    if (document.body.classList.contains("light")) {

        themeToggle.innerHTML = "☀️ Light Mode";

    } else {

        themeToggle.innerHTML = "🌙 Dark Mode";

    }

});

// ======================================
// Progress Bar
// ======================================

function updateProgress(percent) {

    progressBar.style.width = percent + "%";

    progressText.innerText = percent + "%";

}

function resetProgress() {

    progressBar.style.width = "0%";

    progressText.innerText = "0%";

}

// ======================================
// Loader
// ======================================

let loader = document.querySelector(".loader");

if (!loader) {

    loader = document.createElement("div");

    loader.className = "loader";

    loader.innerHTML = `

        <div class="spinner"></div>

        <h2>Creating PDF...</h2>

    `;

    document.body.appendChild(loader);

}

function showLoader() {

    loader.classList.add("show");

}

function hideLoader() {

    loader.classList.remove("show");

}

// ======================================
// Toast Notification
// ======================================

let toast = document.querySelector(".toast");

if (!toast) {

    toast = document.createElement("div");

    toast.className = "toast";

    document.body.appendChild(toast);

}

function showToast(message) {

    toast.innerText = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}

// ======================================
// Utility
// ======================================

function sleep(ms) {

    return new Promise(resolve => setTimeout(resolve, ms));

}
// ======================================
// PART 3
// PDF Generation
// ======================================

convertBtn.addEventListener("click", generatePDF);

async function generatePDF() {

    if (images.length === 0) {

        showToast("Please upload at least one image.");

        return;

    }

    try {

        convertBtn.disabled = true;

        showLoader();

        const { jsPDF } = window.jspdf;

        // ---------- Settings ----------

        const sizeMap = {
            "A4": "a4",
            "Letter": "letter",
            "Legal": "legal"
        };

        const selectedSize = pageSize ? pageSize.value : "A4";

        const format = sizeMap[selectedSize] || "a4";

        const orientation =
            document.getElementById("orientation")?.value || "portrait";

        const margin =
            parseInt(document.getElementById("margin")?.value || 10);

        const quality =
            parseFloat(document.getElementById("quality")?.value || 0.95);

        const fit =
            fitMode ? fitMode.value : "fit";

        const pdfName =
            document.getElementById("pdfName")?.value.trim() ||
            "AlphaDevStack";

        const pdf = new jsPDF({

            orientation: orientation,

            unit: "mm",

            format: format

        });

        const pageWidth = pdf.internal.pageSize.getWidth();

        const pageHeight = pdf.internal.pageSize.getHeight();

        // ---------- Images ----------

        for (let i = 0; i < images.length; i++) {

            updateProgress(
                Math.round(((i + 1) / images.length) * 100)
            );

            const data = await readFile(images[i]);

            const img = new Image();

            img.src = data;

            await new Promise(resolve => {

                img.onload = resolve;

            });

            const maxWidth = pageWidth - margin * 2;

            const maxHeight = pageHeight - margin * 2;

            let drawWidth;

            let drawHeight;

            let x = margin;

            let y = margin;

            if (fit === "fill") {

                drawWidth = maxWidth;

                drawHeight = maxHeight;

            } else {

                const ratio = Math.min(

                    maxWidth / img.width,

                    maxHeight / img.height

                );

                drawWidth = img.width * ratio;

                drawHeight = img.height * ratio;

                x = (pageWidth - drawWidth) / 2;

                y = (pageHeight - drawHeight) / 2;

            }

            if (i > 0) {

                pdf.addPage();

            }

            pdf.addImage(

                data,

                "JPEG",

                x,

                y,

                drawWidth,

                drawHeight,

                undefined,

                "FAST"

            );

            await sleep(150);

        }

        pdf.save(pdfName + ".pdf");

        showToast("✅ PDF downloaded successfully!");

    }

    catch (err) {

        console.error(err);

        showToast("❌ Failed to generate PDF.");

    }

    finally {

        hideLoader();

        resetProgress();

        convertBtn.disabled = false;

    }

}
