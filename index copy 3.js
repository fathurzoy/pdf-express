const express = require("express");
const { jsPDF } = require("jspdf");
const autoTable = require("jspdf-autotable");
const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

let subHeadersLeft = [
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

let subHeaders = [
  {
    value: "",
    position: "right",
  },
  {
    value: "",
    position: "right",
  },
];

const headers = [
  { name: "Tanggal", id: "date" },
  { name: "Waktu", id: "time" },
  { name: "Terminal ID", id: "terminal_id" },
  { name: "Nominal", id: "amount" },
  { name: "Tipe Pembayaran", id: "tipe_trx" },
  { name: "Nomor Kartu/CPAN", id: "cpan" },
  { name: "Status", id: "status" },
];

let total = {
  isExist: true,
  span: 0,
};

// Endpoint to generate the PDF with the table and watermark
app.post("/generate-pdf", async (req, res) => {
  try {
    const datax = req.body;
    console.log(datax);

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

    let refactoring = {
      function: refactoringListDataReportSCM,
      params: {
        listData: data,
        type: "all",
        refactoFunction: convertNumberToUsd,
      },
    };

    // ------------------Generate Header-------------------------//
    doc.setFontSize(fontSizeHeader);
    let heightHeaders = 0;
    headers.forEach((header, i) => {
      console.log(header);
      const height =
        (fontSizeHeader - fontSizeHeader / 2) * (i + 1) + paddingPage.y;
      heightHeaders = height;
      doc.text(header, doc.internal.pageSize.getWidth() / 2, height, {
        align: "center",
        lineHeight,
      });
    });
    // -----------------------Generate Logo------------------------//
    // doc.addImage(
    //   logo.path,
    //   paddingPage.x,
    //   paddingPage.y * 2,
    //   logo.size.width,
    //   logo.size.height,
    // );
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
    doc.setFontSize(fontSizeTable);
    const dataBodyTable = refactoring
      .function(refactoring.params)
      .map((row, i) => {
        return headers.map((column, i) => ({
          content:
            i === 0
              ? new Date(row[column.id]).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                })
              : row[column.id],
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
    headers.forEach((column) => {
      if (column.countTotal) {
        const total = datax.datareduce((total, e) => total + e[column.id], 0);
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
    autoTable(doc, {
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
      didDrawCell: (datax) => {
        if (
          datax.datacolumn.index === 6 &&
          datax.datacell.section === "body" &&
          datax?.cell?.text[0]?.length > 0
        ) {
          const dim =
            datax.datacell.height - datax.datacell.padding("vertical");
          const textPos = datax.datacell;
          const img = new Image();
          if (datax.datacell.text[0].toLowerCase() === "sale") {
            img.src = "/icon/sale.png";
          }
          if (datax.datacell.text[0].toLowerCase() === "void") {
            img.src = "/icon/void.png";
          }
          if (datax.datacell.text[0].toLowerCase() === "refund") {
            img.src = "/icon/refund.png";
          }
          doc.addImage(img.src, textPos.x + 20, textPos.y + 4, 22, 10);
        }
      },
      didDrawPage(datax) {
        // Header
        doc.setFontSize(20);
        doc.setTextColor(40);
        doc.text("Laporan Transaksi", 325, 15);
        doc.setLineJoin(1);
        doc.line(15, 30, 400, 30);
        doc.addImage(
          logo.path,
          paddingPage.x,
          paddingPage.y * 2,
          logo.size.width,
          logo.size.height
        );
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
        headers.map((column, i) => ({
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

    if (typeof doc.putTotalPages === "function") {
      doc.putTotalPages(totalPagesExp);
    }

    doc.save(filename);

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
