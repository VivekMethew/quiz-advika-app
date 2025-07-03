const emailjs = require("emailjs");
const fs = require("fs");
const ejs = require("ejs");
const path = require("path");

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Set up your SMTP server details
const smtpConfig = {
  user: "your_email@example.com", // Replace with your email address
  password: "your_email_password", // Replace with your email password
  host: "smtp.example.com", // Replace with your SMTP server host
  ssl: true, // Use SSL for secure connection (can be false if your server doesn't support SSL)
};

// const client = new SMTPClient(smtpConfig{
// 	user: 'user',
// 	password: 'password',
// 	host: 'smtp-mail.outlook.com',
// 	tls: {
// 		ciphers: 'SSLv3',
// 	},
// });

// Create an email server instance
const server = email.server.connect(smtpConfig);

const formatedDate = () => {
  return new Date().toLocaleString("en-us", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
};

// get templates for sending email in format
const getTemplate = (filename, body) => {
  body.dDate = formatedDate();
  const emailTemplatePath = path.join(__dirname, "emailTemplates", filename);
  const template = fs.readFileSync(emailTemplatePath, { encoding: "utf-8" });
  return ejs.render(template, body);
};

const collection = {
  resetPassword: (body) => ({
    subject: "Reset Password Link",
    html: getTemplate("reset_password.html", body),
  }),
  changedPassword: (body) => ({
    subject: "Password changed successfully",
    html: getTemplate("reset_password_successfull.html", body),
  }),
  productPurchased: (body) => ({
    subject: "Quiz/Poll Successfully Purchased",
    html: getTemplate("product_purchase.html", body),
  }),
  emailVerification: (body) => ({
    subject: "Verification Link",
    html: getTemplate("email_verification.html", body),
  }),
  successVerification: (body) => ({
    subject: "Verication mail",
    html: getTemplate("email_verification_success.html", body),
  }),
  accountBlock: (body) => ({
    subject: "Account Has been blocked",
    html: getTemplate("account_blocked.html", body),
  }),
};

const services = {};

services.send = function (type, body, callback) {
  console.log(body, process.env.SUPPORT_EMAIL);

  // const param = {
  //   to: body.email,
  //   from: process.env.SUPPORT_EMAIL || "vivek.goprotoz@gmail.com",
  //   subject: type(body).subject,
  //   html: type(body).html,
  // };

  return new Promise((resolve, reject) => {
    const param = {
      from: "vivek.m@goprotoz.com", // Replace with your email address
      to: "vivekmethew8@gmail.com", // Replace with recipient's email address
      subject: "Eskoops Testing",
      attachment: [
        {
          data: `<html><body><h1>Hello from Node.js Email</h1><p>This is a test email with HTML template sent using emailjs.</p></body></html>`,
          alternative: true,
        },
      ],
    };

    // Send the email
    server.send(param, (err, message) => {
      if (err) {
        callback ? callback(err) : reject(err);
      } else {
        callback ? callback(null, response) : resolve(message);
      }
    });

    // server
    //   .send(param)
    //   .then((response) =>
    //     callback ? callback(null, response) : resolve(response)
    //   )
    //   .catch((error) => (callback ? callback(error) : reject(error)));

    // sgMail
    //   .send(param)
    //   .then((response) =>
    //     callback ? callback(null, response) : resolve(response)
    //   )
    //   .catch((error) => (callback ? callback(error) : reject(error)));
  });
};

module.exports = { ...services, ...collection };
