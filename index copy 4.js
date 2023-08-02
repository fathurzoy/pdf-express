const express = require("express");
const { jsPDF } = require("jspdf");
const autoTable = require("jspdf-autotable");

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sample data
const data = [
  {
    id: 1,
    name: "John Doe",
    age: 30,
    city: "New York",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
  // Add more data as needed
  {
    id: 2,
    name: "Jane Smith",
    age: 25,
    city: "Los Angeles",
  },
];

// Function to generate the PDF with headers, pagination, footer, and footerheader
function generatePDF(data) {
  const doc = new jsPDF();

  // Header
  const header = [["ID", "Name", "Age", "City"]];

  // Options for autotable
  const options = {
    startY: 40, // Vertical position from where to start table
    margin: { top: 40 },
    theme: "striped",
    headStyles: { fillColor: [100, 100, 100] }, // Customize header color
    footStyles: { fillColor: [200, 200, 200] }, // Customize footer color
    styles: { cellWidth: "auto" },
    addPageContent: function (data) {
      // Footer
      doc.setFontSize(10);
      doc.text("Footer Text", 14, doc.internal.pageSize.height - 10);

      // Footer header
      doc.setFontSize(12);
      doc.text("Page Header", 14, 20);
    },
  };

  // Add pagination to options
  options.beforePageContent = function (data) {
    doc.text("Page " + data.pageCount, 14, 14);
  };

  // Generate table with autotable
  doc.autoTable({
    head: header,
    body: data.map((row) => [row.id, row.name, row.age, row.city]),
    ...options,
  });

  return doc;
}

// Endpoint to generate the PDF
app.post("/generate-pdf", async (req, res) => {
  try {
    const pdfDoc = generatePDF(data);

    // Set the response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="table_with_pagination_and_footer.pdf"'
    );

    // Send the binary PDF data to the response stream
    res.end(pdfDoc.output());
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
