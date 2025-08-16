const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
});

function sendWelcomeEmail(to, name) {
  const mailOptions = {
    from: `"CodeClashZone" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Welcome to CodeClashZone!",
    html: `
  <div style="max-width: 600px; margin: auto; background: #0d0d0d; padding: 30px; border-radius: 10px; font-family: 'Segoe UI', sans-serif; color: #f3f3f3; box-shadow: 0 4px 12px rgba(255,255,255,0.05);">
    <div style="text-align: center;">
      <img src="https://media.giphy.com/media/kGScT2XJPxCyikr5QN/giphy.gif?cid=ecf05e474kagnkcbhef3edpq38y96drnsrzm4ae36nw6ofx9&ep=v1_gifs_search&rid=giphy.gif&ct=g" 
           alt="Welcome GIF" style="width: 100%; max-height: 350px; border-radius: 10px; object-fit: cover;" />
      <h1 style="color: #c084fc; margin-top: 20px;">Welcome to CodeClashZone!</h1>
    </div>

    <p style="font-size: 16px; color: #e2e8f0;">Hi <strong>${name}</strong>,</p>
    <p style="font-size: 15px; color: #cbd5e1;">
      You’ve just stepped into a zone where coders rise and champions are made! 👩‍💻🔥<br/>
      We’re thrilled to have you on board.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://codeclashzone.vercel.app/dashboard" 
         style="background: linear-gradient(to right, #9333ea, #7e22ce); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; box-shadow: 0 0 10px #9333ea;">
        Enter the Arena 💻
      </a>
    </div>

    <p style="font-size: 14px; color: #94a3b8;">
      If you have any questions, feel free to reply to this email — we're always here to help.
    </p>

    <hr style="margin: 30px 0; border: none; border-top: 1px solid #334155;" />

    <p style="font-size: 13px; color: #94a3b8;">
      With ❤️ from <br/>
      <strong style="color: #c084fc;">Creators of CodeClashZone</strong><br/>
      <a href="mailto:mehekf.dev@gmail.com" style="color: #a78bfa;">mehekf.dev@gmail.com</a>
    </p>
  </div>
`
  };

  return transporter.sendMail(mailOptions);
}

module.exports = {
  sendWelcomeEmail,
};
