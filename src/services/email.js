import nodemailer from "nodemailer";
import createHttpError from "http-errors";

export const sendEmail = async (data) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: data.to,
      subject: data.subject,
      html: data.html,
    });

    return true;
  } catch (error) {
    console.log("SENDER HATASI DETAYI:", error.message);
    throw createHttpError(500, "Failed to send the email.");
  }
};