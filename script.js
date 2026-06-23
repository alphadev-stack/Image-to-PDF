convertBtn.addEventListener("click", async function () {

    if(images.length===0){
        alert("Upload images first");
        return;
    }

    convertBtn.disabled=true;

    const sizes={
        A4:[210,297],
        Letter:[216,279],
        Legal:[216,356]
    };

    const selected=pageSize.value;

    const pdf=new jspdf.jsPDF({
        orientation:"portrait",
        unit:"mm",
        format:sizes[selected]
    });

    const pdfWidth=sizes[selected][0];
    const pdfHeight=sizes[selected][1];

    for(let i=0;i<images.length;i++){

        progressBar.style.width=((i+1)/images.length*100)+"%";
        progressText.innerHTML=Math.round((i+1)/images.length*100)+"%";

        const data=await readFile(images[i]);

        const img=new Image();

        img.src=data;

        await new Promise(r=>img.onload=r);

        let w,h,x=0,y=0;

        if(fitMode.value==="fit"){

            const ratio=Math.min(pdfWidth/img.width,pdfHeight/img.height);

            w=img.width*ratio;
            h=img.height*ratio;

            x=(pdfWidth-w)/2;
            y=(pdfHeight-h)/2;

        }

        else if(fitMode.value==="fill"){

            w=pdfWidth;
            h=pdfHeight;

        }

        else{

            const ratio=pdfWidth/img.width;

            w=pdfWidth;
            h=img.height*ratio;

        }

        if(i>0)
            pdf.addPage();

        pdf.addImage(data,"JPEG",x,y,w,h);

    }

    pdf.save("AlphaDevStack.pdf");

    progressBar.style.width="0%";
    progressText.innerHTML="0%";

    showToast("PDF Downloaded Successfully");

    convertBtn.disabled=false;

});
