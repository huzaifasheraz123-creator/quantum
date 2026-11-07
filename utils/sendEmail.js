const nodemailer = require('nodemailer');

const createTransporter = () => {
  const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const emailPort = Number(process.env.EMAIL_PORT || 587);
  const emailUser = process.env.EMAIL_USER || 'mtaqeer777@gmail.com';
  const emailPass = process.env.EMAIL_PASS || '';

  return nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465,
    auth: emailUser && emailPass ? { user: emailUser, pass: emailPass } : undefined,
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  if (!process.env.EMAIL_PASS) {
    console.log('Email not sent: EMAIL_PASS is not configured.');
    console.log('Preview:', { to, subject, text });
    return { success: true, preview: true };
  }

  const mailOptions = {
    from: process.env.EMAIL_USER || 'mtaqeer777@gmail.com',
    to,
    subject,
    text,
    html,
  };

  await transporter.sendMail(mailOptions);
  return { success: true };
};

module.exports = { sendEmail };
