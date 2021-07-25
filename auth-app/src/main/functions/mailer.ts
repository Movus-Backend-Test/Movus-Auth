import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    pool: true,
    host: process.env.SMTP_HOST,
    port: 587,
    tls: {
        secureProtocol: "TLSv1_method"
    },
    auth: {
      user: 'no-reply@advistm.tech',
      pass: process.env.SMTP_PASSWORD
    }
})

transporter.verify((error, success) => {
  if (error) {
    console.error(error)
  }
  else {
    console.log('Server is ready to take messages')
  }
})

const email = async (data) => {
  transporter.sendMail(data, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
  });
}

export default email