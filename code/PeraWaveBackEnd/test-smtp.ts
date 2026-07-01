import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: parseInt('587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: undefined,
    pass: undefined,
  },
});

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"PeraWave" <${undefined}>`,
      to,
      subject,
      text,
      html,
    });
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

async function test() {
    await sendEmail("test@example.com", "test", "test");
}
test();
