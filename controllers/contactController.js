const { sendEmail } = require('../utils/sendEmail');

const sendContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    await sendEmail({
      to: process.env.EMAIL_USER || 'mtaqeer777@gmail.com',
      subject: `New inquiry from ${name || 'Website Visitor'}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`,
      html: `
        <h2>New Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: 'Inquiry sent successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  sendContact,
};
