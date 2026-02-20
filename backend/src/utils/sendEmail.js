import dotenv from 'dotenv';
dotenv.config(); // <-- IMPORTANT (MUST BE FIRST)

import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
});



transporter.verify((error, success) => {
//   console.log('SMTP_HOST:', process.env.SMTP_HOST);
// console.log('SMTP_PORT:', process.env.SMTP_PORT);
// console.log('SMTP_USER:', process.env.SMTP_USER);

  if (error) {
    console.log('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready');
  }
});

export const sendEmail = async (to, subject, html) => {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"Alumni Connect" <no-reply@alumniconnect.com>',
    to,
    subject,
    html,
  });
  console.log('Email sent:', info.messageId);
  return info;
};



