import nodemailer from "nodemailer";
import XLSX from "xlsx";
import fs from "fs";
import path from "path";

const pdfFilePath = "D:/WorkSpace/Pet-Hut/pet-hut-scripts/EIN06807-C.pdf";
const excelFilePath = "D:/WorkSpace/Pet-Hut/pet-hut-scripts/emails.xlsx";

function readEmailsFromExcel(filePath: string): string[] {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<{ email: string }>(sheet);
    const emails = data.map((row) => row.email);

    console.log("Retrieved emails:", emails);
    return emails;
  } catch (error) {
    console.error("Error reading emails from Excel:", error);
    return [];
  }
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "shashankgowda7275@gmail.com",
    pass: "kmwk hleg ofap voxh",
  },
});

async function sendEmail(email: string) {
  try {
    if (!email) {
      throw new Error("No recipient email defined.");
    }

    const pdfContent = fs.readFileSync(pdfFilePath);
    const mailOptions = {
      from: "shashankgowda7275@gmail.com",
      to: email,
      subject: "Your PDF Attachment",
      text: "Please find the attached PDF file.",
      attachments: [
        {
          filename: path.basename(pdfFilePath),
          content: pdfContent,
        },
      ],
    };
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${email}`);
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error);
  }
}

(async function sendPdfToAllEmails() {
  const emails = readEmailsFromExcel(excelFilePath);
  if (emails.length === 0) {
    console.log("No emails found to send.");
    return;
  }

  for (const email of emails) {
    if (email) {
      await sendEmail(email);
    } else {
      console.error("Skipped undefined email address.");
    }
  }
})();
