// const sgMail = require("@sendgrid/mail");
const { createTransport } = require("nodemailer");
const fs = require("fs");
const ejs = require("ejs");
const path = require("path");

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const transporter = createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SUPPORT_EMAIL,
    pass: process.env.SENDGRID_API_KEY,
  },
});

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
  //   if (process.env.NODE_ENV !== 'prod') return callback();
  return new Promise((resolve, reject) => {
    // const param = {
    //   to: body.email,
    //   from: process.env.SUPPORT_EMAIL || "vivek.goprotoz@gmail.com",
    //   subject: type(body).subject,
    //   html: type(body).html,
    // };
    // sgMail
    //   .send(param)
    //   .then((response) =>
    //     callback ? callback(null, response) : resolve(response)
    //   )
    //   .catch((error) => (callback ? callback(error) : reject(error)));

    const mailOptions = {
      from: process.env.SUPPORT_EMAIL,
      to: body.email,
      subject: type(body).subject,
      html: type(body).html,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        callback ? callback(error) : reject(error);
      }
      callback ? callback(null, info) : resolve(info);
    });
  });
};

module.exports = { ...services, ...collection };
