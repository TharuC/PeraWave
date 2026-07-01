"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const resend_1 = require("resend");
// Resend SDK - uses HTTPS (port 443), never blocked by cloud providers
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const sendEmail = async (to, subject, text, html) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'PeraWave <onboarding@resend.dev>',
            to,
            subject,
            text,
            html: html || `<p>${text.replace(/\n/g, '<br/>')}</p>`,
        });
        if (error) {
            console.error('Resend error:', error);
            return false;
        }
        console.log('Email sent successfully. ID:', data?.id);
        return true;
    }
    catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};
exports.sendEmail = sendEmail;
