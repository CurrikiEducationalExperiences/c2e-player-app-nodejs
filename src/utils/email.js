const nodemailer = require('nodemailer');
require("dotenv").config();

class emailService {
    static async sendEmail(params) {
        let transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        let mailOptions = {}
        if (params.html) {
            mailOptions = {
                to: params.email,
                subject: params.subject,
                html: params.body
            };
        }
        else {
            mailOptions = {
                to: params.email,
                subject: params.subject,
                text: params.body
            };
        }
        await transporter.sendMail(mailOptions);
        return true
    }

}
module.exports = { emailService }; 