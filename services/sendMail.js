import dotenv from "dotenv"
import nodemailer from "nodemailer"
import { util } from "../helpers/global.js"
dotenv.config()



export default function sendMail(res, from, to, payload = {}) {

    if (from === undefined || to === undefined) {
        return util.sendJson(res, { error: true, message: "Failed to send mail, [ftom, to, payload] params might be missing" }, 400)
    }

    if (payload.body === undefined) {
        return util.sendJson(res, { error: true, message: "Failed to send mail, payload [body] is undefined" }, 400)
    }
    if (payload.subject === undefined) {
        return util.sendJson(res, { error: true, message: "Failed to send mail, payload [subject] is undefined" }, 400)
    }
    if (payload.subject === "") {
        return util.sendJson(res, { error: true, message: "Failed to send mail, payload [subject] is empty" }, 400)
    }
    if (payload.body === "") {
        return util.sendJson(res, { error: true, message: "Failed to send mail, payload [body] is empty" }, 400)
    }

    if (Object.entries(payload).length === 0) {
        return util.sendJson(res, { error: true, message: "Failed to send mail, empty payload" }, 400)
    }

    if (from === "") {
        return util.sendJson(res, { error: true, message: "Failed to send mail, from is empty" }, 400)
    }
    if (to === "") {
        return util.sendJson(res, { error: true, message: "Failed to send mail, to is empty" }, 400)
    }

    const { subject, body } = payload


    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
        }
    });

    let mailOptions = {
        from,
        to,
        subject,
        html: body
    };

    try {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return util.sendJson(res, { error: true, message: error.message }, 400)
            } else {
                return util.sendJson(res, { error: false, message: info.response }, 200)
            }
        });
    } catch (err) {
        return util.sendJson(res, { error: true, message: err.message }, 500)
    }

}
