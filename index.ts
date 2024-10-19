import nodemailer from "nodemailer";
import XLSX from "xlsx";
import fs from "fs";
import path from "path";

const pdfFilePath = "Add your pdf file path here";
const excelFilePath = "Add your excel file path here";

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
    user: "Your email id here",
    pass: "App password in Gmail here 16 character",
  },
});

async function sendEmail(email: string) {
  try {
    if (!email) {
      throw new Error("No recipient email defined.");
    }

    const pdfContent = fs.readFileSync(pdfFilePath);
    const mailOptions = {
      from: "Add your email here",
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
