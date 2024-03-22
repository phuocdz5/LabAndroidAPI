const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "lynaxhai624@gmail.com",
        pass: "nmcd almn lycu aupx"
    },
});

module.exports = transporter;