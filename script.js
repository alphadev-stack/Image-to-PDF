// ==============================
// AlphaDev Stack - Image to PDF
// ==============================

const input = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const convertBtn = document.getElementById("convertBtn");

let images = [];

// Upload Images
input.addEventListener("change", function (e) {

    images = [...images, ...Array.from(e.target.files)];

    renderImages();

});

// Render Preview
function renderImages() {

    preview.innerHTML = "";

    images.forEach((file, index) => {

        const reader = new FileReader();

        reader.onload = function (event) {

            const card = document.createElement("div");
            card.className = "imageCard";

            card.innerHTML = `

            <button class="removeBtn" onclick="removeImage(${index})">

            <i class="fa-solid fa-xmark"></i>

            </button>

            <img src="${event.target.result}">

            <p class="imageName">${file.name}</p>

            `;

            preview.appendChild(card);

        }

        reader.readAsDataURL(file);

    });

}

// Delete Image
window.removeImage = function(index){

    images.splice(index,1);

    renderImages();

}

// Convert PDF
convertBtn.addEventListener("click", async function(){

    if(images.length===0){

        alert("Please upload images first.");

        return;

    }

    convertBtn.classList.add("loading");

    convertBtn.innerHTML="Creating PDF";

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF();

    for(let i=0;i<images.length;i++){

        const file=images[i];

        const data=await readFile(file);

        const img=new Image();

        img.src=data;

        await new Promise(resolve=>{

            img.onload=resolve;

        });

        const width=210;

        const height=(img.height/img.width)*210;

        if(i>0){

            pdf.addPage();

        }

        pdf.addImage(data,"JPEG",0,0,width,height);

    }

    pdf.save("AlphaDevStack.pdf");

    showToast("✅ PDF Downloaded Successfully");

    convertBtn.classList.remove("loading");

    convertBtn.innerHTML=`<i class="fa-solid fa-file-arrow-down"></i> Convert To PDF`;

});

// Read File
function readFile(file){

    return new Promise(resolve=>{

        const reader=new FileReader();

        reader.onload=e=>resolve(e.target.result);

        reader.readAsDataURL(file);

    });

}
// Drag & Drop

const uploadBox = document.querySelector(".uploadBox");

["dragenter","dragover"].forEach(event=>{

uploadBox.addEventListener(event,e=>{

e.preventDefault();

uploadBox.style.borderColor="#3b82f6";

});

});

["dragleave","drop"].forEach(event=>{

uploadBox.addEventListener(event,e=>{

e.preventDefault();

uploadBox.style.borderColor="rgba(96,165,250,.5)";

});

});

uploadBox.addEventListener("drop",e=>{

images=[...images,...Array.from(e.dataTransfer.files)];

renderImages();

});
function showToast(message){

const toast=document.createElement("div");

toast.innerText=message;

toast.style.position="fixed";

toast.style.bottom="30px";

toast.style.right="30px";

toast.style.padding="15px 25px";

toast.style.background="#22c55e";

toast.style.color="white";

toast.style.borderRadius="12px";

toast.style.fontWeight="600";

toast.style.zIndex="9999";

toast.style.boxShadow="0 10px 30px rgba(0,0,0,.3)";

document.body.appendChild(toast);

setTimeout(()=>{

toast.remove();

},3000);

}
