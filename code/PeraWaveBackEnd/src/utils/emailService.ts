import { Resend } from 'resend';

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('RESEND_API_KEY is not set — skipping email send.');
    return false;
  }

  // Resend SDK - uses HTTPS (port 443), never blocked by cloud providers
  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: 'PeraWave <noreply@perawave.com>',
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
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
