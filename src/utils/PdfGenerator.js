const path = require("path");
const fs = require("fs");
const ejs = require("ejs");

const formatedDate = () => {
  return new Date().toLocaleString("en-us", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
};

// Convert image to base64 data URI
const getImageDataUri = (imagePath) => {
  const image = fs.readFileSync(imagePath);
  return `data:image/png;base64,${image.toString("base64")}`;
};

// get templates for sending email in format
const getTemplate = (dirname, filename, body) => {
  body.dDate = formatedDate();

  // Get data URI for images
  const logoImageDataUri = getImageDataUri(
    path.join(dirname, "reports", "Eskoops-Logo.png")
  );
  const phoneImageDataUri = getImageDataUri(
    path.join(dirname, "reports", "Phone.png")
  );
  const mailImageDataUri = getImageDataUri(
    path.join(dirname, "reports", "mail.png")
  );

  // Update body with image data URIs
  body.logoImagePath = logoImageDataUri;
  body.phoneImagePath = phoneImageDataUri;
  body.mailImagePath = mailImageDataUri;

  const emailTemplatePath = path.join(dirname, "reports", filename);
  const template = fs.readFileSync(emailTemplatePath, { encoding: "utf-8" });
  return ejs.render(template, body);
};

exports.donwloadReport = async (filename, body) => {
  try {
    body.eskoopPhone = process.env.SUPPORT_PHONE;
    body.eskoopEmail = process.env.SUPPORT_EMAIL;
    body.eskoopText = "Thank You for Choosing Our Product!";
    body.webName = "www.eskoops.com";

    const htmlContent = getTemplate(__dirname, filename, body);
    // const outputPath = path.join(__dirname, "reports/pdf");
    // const outputFilename = `file${Date.now()}.pdf`;

    // const browser = await puppeteer.launch();
    // const page = await browser.newPage();
    // await page.setViewport({ width: 1000, height: 1000 });
    // await page.setContent(htmlContent);
    // await page.pdf({
    //   path: path.join(outputPath, outputFilename),
    //   format: "A4",
    //   printBackground: true,
    // });
    // await browser.close();

    // const pdfOutputPath = path.join(outputPath, outputFilename);
    return {
      success: true,
      message: "success",
      htmlContent: htmlContent,
    };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return { success: false, message: error.message };
  }
};
