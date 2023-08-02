const express = require("express");
const { jsPDF } = require("jspdf");
require("jspdf-autotable");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const { createCanvas, loadImage } = require("canvas");

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Endpoint to generate the PDF with the table and watermark
app.get("/generate-pdf", async (req, res) => {
  try {
    // Create a new PDF document
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Read the image file and convert it to a data URI
    const logoPath = "logo_bri.png";
    const logoDataUri = `data:image/png;base64,${fs
      .readFileSync(logoPath)
      .toString("base64")}`;

    // Add the image (logo) to the PDF using the data URI
    doc.addImage(logoDataUri, "png", 10, 10, 50, 50);

    // // Loop to create three pages
    // for (let pageNum = 1; pageNum <= 3; pageNum++) {
    //   if (pageNum !== 1) {
    //     doc.addPage(); // Add a new page for pages 2 and 3
    //   }

    //   // Add the table using jspdf-autotable
    //   doc.autoTable({
    //     head: [headers],
    //     body: rows,
    //     startY: 40,
    //     theme: "grid",
    //     styles: {
    //       fontSize: fontSize,
    //     },
    //     columnStyles: columnStyles,
    //   });

    //   // Add watermark on every page
    //   const watermarkText = "CONFIDENTIAL";
    //   const watermarkFontSize = 40;
    //   const watermarkWidth =
    //     (doc.getStringUnitWidth(watermarkText) * watermarkFontSize) /
    //     doc.internal.scaleFactor;
    //   const watermarkHeight = watermarkFontSize;
    //   const centerPosX = (doc.internal.pageSize.width - watermarkWidth) / 2;
    //   const centerPosY = (doc.internal.pageSize.height - watermarkHeight) / 2;

    //   doc.setFontSize(watermarkFontSize);
    //   doc.setTextColor(200, 200, 200);
    //   doc.text(watermarkText, centerPosX, centerPosY);

    //   // Add footer to each page
    //   doc.setTextColor(0, 0, 0);
    //   const pageCount = doc.getNumberOfPages();
    //   doc.setPage(pageNum);
    //   doc.setFontSize(12);
    //   doc.text(
    //     `Page ${pageNum} of ${pageCount}`,
    //     10,
    //     doc.internal.pageSize.height - 10
    //   );
    // }

    // Save the PDF and send it as a response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="table_with_watermark.pdf"'
    );
    res.send(doc.output());
  } catch (error) {
    console.error("Error generating PDF:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating the PDF." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// const fs = require("fs");
// const { jsPDF } = require("jspdf");

// // Read the image file and convert it to a data URI
// const logoPath = "logo_bri.png";
// const logoDataUri = `data:image/png;base64,${fs
//   .readFileSync(logoPath)
//   .toString("base64")}`;

//   // Add the image (logo) to the PDF using the data URI
//   doc.addImage(logoDataUri, "png", 10, 10, 50, 50);

//   // Create a new PDF document
//   const doc = new jsPDF();

// // Save the PDF
// const pdfPath = "./output.pdf";
// doc.save(pdfPath);

// console.log("PDF with image created successfully.");
