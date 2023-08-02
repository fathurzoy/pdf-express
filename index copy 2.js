// const express = require("express");
// const { jsPDF } = require("jspdf");
// const fs = require("fs");
// const path = require("path");

// const app = express();
// const port = 3000;

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

// // Endpoint to generate the PDF with the table and watermark
// app.get("/generate-pdf", (req, res) => {
//   try {
//     // Create a new PDF document
//     const doc = new jsPDF({
//       orientation: "portrait",
//       unit: "mm",
//       format: "a4",
//     });

//     // Construct the absolute path to the image file
//     const logoPath = path.join(__dirname, "assets/images/logo_bri_ss.png");
//     // Read the image file and convert it to a data URI
//     const logoDataUri = `data:image/png;base64,${fs
//       .readFileSync(logoPath)
//       .toString("base64")}`;
//     // Add the image (logo) to the PDF using the data URI
//     doc.addImage(logoDataUri, "png", 10, 10, 30, 10);

//     // Get the binary PDF data as a Uint8Array
//     const pdfData = doc.output("arraybuffer");

//     // Set the response headers
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       'attachment; filename="table_with_watermark.pdf"'
//     );

//     // Send the binary PDF data to the response stream
//     res.end(Buffer.from(pdfData));
//   } catch (error) {
//     console.error("Error generating PDF:", error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while generating the PDF." });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

const express = require("express");
const { jsPDF } = require("jspdf");
const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");

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

    // Construct the absolute path to the image file
    const logoPath = path.join(__dirname, "assets/images/logo_bri_ss.png");

    // Read the image file using Jimp
    const image = await Jimp.read(logoPath);

    // Add the image (logo) to the PDF as PNG format
    const imageBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
    doc.addImage(imageBuffer, "PNG", 10, 10, 30, 10);

    // Get the binary PDF data as a Uint8Array
    const pdfData = doc.output("arraybuffer");

    // Set the response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="table_with_watermark.pdf"'
    );

    // Send the binary PDF data to the response stream
    res.end(Buffer.from(pdfData));
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
