const express = require("express");
const { jsPDF } = require("jspdf");
const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");
require("jspdf-autotable");

const app = express();
const port = 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const headers = ["", "", ""];

const subHeadersLeft = [
  {
    value: "Jenis Channel \t\t: EDC",
    position: "right",
  },
  {
    value: "Rekening\t\t\t : 044201015718507 - Andrew",
    position: "right",
  },
  {
    value: "merchant ID \t  \t : 9360000202104614723 - MCN",
    position: "right",
  },
  {
    value: "Periode Transaksi  \t : 20-07-2023",
    position: "right",
  },
];

const subHeaders = [
  {
    value: "",
    position: "right",
  },
  {
    value: "",
    position: "right",
  },
];

const columns = [
  {
    name: "Tanggal",
    id: "date",
  },
  {
    name: "Waktu",
    id: "time",
  },
  {
    name: "Terminal ID",
    id: "terminal_id",
  },
  {
    name: "Nominal",
    id: "amount",
  },
  {
    name: "Tipe Pembayaran",
    id: "tipe_trx",
  },
  {
    name: "Nomor Kartu/CPAN",
    id: "cpan",
  },
  {
    name: "Status",
    id: "status",
  },
];

const total = {
  isExist: true,
  span: 0,
};

const logoTarget = [{ x: 0, y: 0 }];

const refactoringListDataReportSCM = (params) => {
  const { listData, type, refactoFunction } = params;
  const refactoListData = listData?.map((data, i) => {
    const refactoData = {
      date: data?.date,
      time: data?.time,
      terminal_id: data?.terminal_id,
      amount: data?.amount,
      tipe_trx: data?.tipe_trx,
      cpan: data?.cpan,
      status: data?.status,
    };
    return refactoData;
  });
  return refactoListData;
};

function convertNumberToUsd(value) {
  if (value == "-") return value;
  if (value === "" || value === null || value === undefined) return null;
  if (value === "N/A") return value;
  let number = Math.abs(value).toFixed(2).split(".");
  number[0] = number[0]
    .split("")
    .reverse()
    .map((c, i, a) => (i > 0 && i < a.length && i % 3 == 0 ? `${c}.` : c))
    .reverse()
    .join("");
  return `${(Math.sign(value) < 0 ? "-" : "") + number.join(",")}`;
}

const imageBuff = async (pathImage) => {
  // Construct the absolute path to the image file
  const logoPath = path.join(__dirname, pathImage);
  // Read the image file using Jimp
  const image = await Jimp.read(logoPath);
  // Add the image (logo) to the PDF as PNG format
  const imageBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
  return imageBuffer;
};

// Endpoint to generate the PDF with the table and watermark
app.post("/generate-pdf", async (req, res) => {
  try {
    const datax = req.body;
    const dataq = datax.data;
    console.log(datax);

    // Create a new PDF document
    const doc = new jsPDF({
      orientation: "l",
      unit: "mm",
      format: "a3",
    });

    const size = {
      width: doc.internal.pageSize.width,
      height: doc.internal.pageSize.height,
    };
    const fontSizeHeader = 12;
    const fontSizeSubHeader = 12;
    const fontSizeTable = 11;

    const paddingPage = {
      x: 15,
      y: 5,
    };
    const lineHeight = 1;

    // ------------------Generate Header-------------------------//

    doc.setFontSize(fontSizeHeader);
    let heightHeaders = 0;
    headers.forEach((header, i) => {
      const height =
        (fontSizeHeader - fontSizeHeader / 2) * (i + 1) + paddingPage.y;
      heightHeaders = height;
      doc.text(
        header.toUpperCase(),
        doc.internal.pageSize.getWidth() / 2,
        height,
        { align: "center", lineHeight }
      );
    });

    // --------------------Generate Sub Headers (left)-------------------//
    doc.setFontSize(fontSizeSubHeader);
    let heightLeftSubHeaders = heightHeaders;
    subHeadersLeft.forEach((subHeader, i) => {
      const height =
        (fontSizeSubHeader - fontSizeSubHeader / 2) * (i + 1) +
        heightHeaders +
        paddingPage.y * 2;
      heightLeftSubHeaders = height;
      if (subHeader.position == "right") {
        doc.text(subHeader.value, paddingPage.x, height, {
          align: subHeaders.position,
          lineHeight,
        });
      } else {
        const textWidth = doc.getTextWidth(subHeader.value);
        doc.text(
          subHeader.value,
          size.width - textWidth - paddingPage.x,
          height
        );
      }
    });

    // --------------------Generate Sub Headers (right)-------------------//
    doc.setFontSize(fontSizeSubHeader);
    let heightSubHeaders = heightHeaders;
    subHeaders.forEach((subHeader, i) => {
      const height =
        (fontSizeSubHeader - fontSizeSubHeader / 2) * (i + 1) +
        heightHeaders +
        paddingPage.y * 2;
      heightSubHeaders = height;
      if (subHeader.position == "left") {
        doc.text(subHeader.value, paddingPage.x, height, {
          align: subHeaders.position,
          lineHeight,
        });
      } else {
        const textWidth = doc.getTextWidth(subHeader.value);
        doc.text(
          subHeader.value,
          size.width - textWidth - paddingPage.x,
          height
        );
      }
    });

    // -------------------line-----------------------------//
    // doc.setLineJoin(1);
    // doc.line(15, 60, 400, 60);

    // -------------------Generate Table-----------------------------//
    doc.setFontSize(fontSizeTable);
    const refactoring = {
      function: refactoringListDataReportSCM,
      params: {
        listData: datax.data,
        type: "all",
      },
    };
    const dataBodyTable = refactoring
      .function(refactoring.params)
      .map((row, i) => {
        return columns.map((column, i) => ({
          content: row[column.id],
          styles: {
            halign: "center",
            lineWidth: 0,
            minCellHeight: 20,
            lineColor: "black",
            valign: "middle",
          },
        }));
      });

    const totalRow = [
      {
        content: total.span === 0 ? "" : "Total",
        colSpan: total.span,
        styles:
          total.span === 0
            ? {
                halign: "center",
                textColor: "black",
                fillColor: "white",
                lineWidth: 0,
                lineColor: "black",
              }
            : {
                halign: "center",
                textColor: "black",
                fillColor: "white",
                lineWidth: 0.5,
                lineColor: "black",
              },
      },
    ];
    columns.forEach((column) => {
      if (column.countTotal) {
        const total = datax.data.reduce((total, e) => total + e[column.id], 0);
        totalRow.push({
          content: convertNumberToUsd(total),
          styles: {
            halign: "right",
            textColor: "black",
            fillColor: "white",
            lineWidth: 0.5,
            lineColor: "black",
          },
        });
      }
    });
    dataBodyTable.push(totalRow);
    let pageCount = 1;
    let { pageSize } = doc.internal;
    let pageHeight = pageSize.height;
    const totalPagesExp = "{total_pages_count_string}";
    doc.autoTable({
      startY: heightSubHeaders * 1.3 + paddingPage.y,
      margin: { top: 40 },
      theme: "striped",
      showHead: "everyPage",
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 50 },
        2: { cellWidth: 70 },
        3: { cellWidth: 50 },
        4: { cellWidth: 40 },
        5: { cellWidth: 55 },
        6: { cellWidth: 60 },
      },
      didDrawCell: (dataq) => {
        if (
          dataq.column.index === 6 &&
          dataq.cell.section === "body" &&
          dataq?.cell?.text[0]?.length > 0
        ) {
          const dim = dataq.cell.height - dataq.cell.padding("vertical");
          const textPos = dataq.cell;
          // const img = new Image();
          // if (dataq.cell.text[0].toLowerCase() === 'sale') {
          //   img.src = '/icon/sale.png';
          // }
          // if (dataq.cell.text[0].toLowerCase() === 'void') {
          //   img.src = '/icon/void.png';
          // }
          // if (dataq.cell.text[0].toLowerCase() === 'refund') {
          //   img.src = '/icon/refund.png';
          // }
          // doc.addImage(img.src, textPos.x + 20, textPos.y + 4, 22, 10);
        }
      },
      didDrawPage: async (dataq) => {
        // Construct the absolute path to the image file
        const logoPath = path.join(__dirname, "assets/images/logo_bri_ss.png");
        // Read the image file using Jimp
        const image = await Jimp.read(logoPath);
        // Add the image (logo) to the PDF as PNG format
        const imageBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
        doc.addImage(imageBuffer, "PNG", paddingPage.x, paddingPage.y * 2, 45, 15);
        
        // Header
        doc.setFontSize(20);
        doc.setTextColor(40);
        doc.text("Laporan Transaksi", 325, 15);
        doc.setLineJoin(1);
        doc.line(15, 30, 400, 30);

        // logoTarget.push({ x: paddingPage.x, y: paddingPage.y * 2 });
        

        // subheader1
        doc.setFontSize(fontSizeSubHeader);
        // subheader2
        doc.setFontSize(fontSizeSubHeader);
        let heightSubHeaders = heightHeaders;
        subHeaders.forEach((subHeader, i) => {
          const height =
            (fontSizeSubHeader - fontSizeSubHeader / 2) * (i + 1) +
            heightHeaders +
            paddingPage.y * 2;
          heightSubHeaders = height;
          if (subHeader.position == "left") {
            doc.text(subHeader.value, paddingPage.x, height, {
              align: subHeaders.position,
              lineHeight,
            });
          } else {
            const textWidth = doc.getTextWidth(subHeader.value);
            doc.text(
              subHeader.value,
              size.width - textWidth - paddingPage.x,
              height
            );
          }
        });
        doc.setFontSize(14);
        doc.setTextColor(40);
        pageCount = doc.internal.getNumberOfPages();
        pageSize = doc.internal.pageSize;
        pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.text(`${pageCount} dari ${totalPagesExp}`, 367, pageHeight - 275);
        doc.setFontSize(12);
        
      },
      head: [
        columns.map((column, i) => ({
          content: column.name,
          dataKey: column.id,
          styles: {
            halign: "center",
            valign: "middle",
            textColor: "black",
            fillColor: "#A7D8E5",
            lineWidth: 0,
            lineColor: "black",
            minCellHeight: 17.5,
          },
        })),
      ],
      body: dataBodyTable,
    });

    for (let index = 0; index < logoTarget.length; index++) {
      if (index > 0){
        console.log(logoTarget[index].x)
        console.log(logoTarget[index].y)
        // Construct the absolute path to the image file
        const logoPath = path.join(__dirname, "assets/images/logo_bri_ss.png");
        // Read the image file using Jimp
        const image = await Jimp.read(logoPath);
        // Add the image (logo) to the PDF as PNG format
        const imageBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
        doc.addImage(imageBuffer, "PNG", logoTarget[index].x, logoTarget[index].y, 45, 15);
      }
    }
    

    if (typeof doc.putTotalPages === "function") {
      doc.putTotalPages(totalPagesExp);
    }

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
