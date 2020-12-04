import nodemailer from 'nodemailer';

export const sendMail = (to, subject, message) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email', port: 587, secure: false, // true for 465, false for other ports
        auth: {
            user: 'd5phtfabhbwydkxg@ethereal.email', // generated ethereal user
            pass: 'ewFTcPugtTXzdbAquS' // generated ethereal password
        }
    });

    // setup email data with unicode symbols
    const mailOptions = {
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: to,
        subject: subject,
        text: message,
        html: message
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if ( error ) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com> Preview URL:
        // https://ethereal.email/message/WaQKMgKddxQDoou...
    });
};