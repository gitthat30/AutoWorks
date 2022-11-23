const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: 'team_autoworks@hotmail.com',
    pass: '1Bopping!'
  }
})

send = (mail) => {
  transporter.sendMail(mail, (error, info) => {
    if(error)
      console.log(error)
    else
      console.log(info)
  })
}

module.exports = send;