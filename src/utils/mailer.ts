import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email: string, code: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const mailOptions = {
    from: `"My App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Mã kích hoạt tài khoản",
    html: `<h3>Mã kích hoạt tài khoản của bạn là: <b>${code}</b></h3>`,
  };

  await transporter.sendMail(mailOptions);
};
