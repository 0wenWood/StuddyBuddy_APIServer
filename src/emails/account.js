const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_KEY);

const sendVerificationEmail = async (toEmail, firstName, token) => {
    const msg = {
        to: toEmail,
        from: 'owood@eagles.bridgewater.edu',
        subject: 'Welcome to Study Buddy',
        html: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd" >
        <html data-editor-version="2" class="sg-campaigns" xmlns="http://www.w3.org/1999/xhtml">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
                <!--[if !mso]><!-->
                    <meta http-equiv="X-UA-Compatible" content="IE=Edge">
                <!--<![endif]-->
                <!--[if (gte mso 9)|(IE)]>
                    <xml>
                        <o:OfficeDocumentSettings>
                        <o:AllowPNG />
                        <o:PixelsPerInch>96</o:PixelsPerInch>
                        </o:OfficeDocumentSettings>
                    </xml>
                <![endif]-->
                <!--[if (gte mso 9)|(IE)]>
                    <style type="text/css">
                        body {width: 600px;margin: 0 auto;}
                        table {border - collapse: collapse;}
                        table, td {mso - table - lspace: 0pt;mso-table-rspace: 0pt;}
                    </style>
                <![endif]-->
                <link href="https://fonts.googleapis.com/css?family=Muli&display=swap" rel="stylesheet">

                <style>
                    body {
                        background-color: hsl(84, 41%, 90%);
                        font-family: Arial, Helvetica, sans-serif;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        max-width: 100%;
                        margin: 0;
                    }

                    body *:not(a) {
                        padding: 5px;
                    }
                    
                    .button {
                        background-color: #525B88;
                        border: 1px solid #525B88;
                        color: #FFFFFF;
                        display: inline-block;
                        font-size: 14;
                        padding: 12px 40px;
                        text-align: center;
                        text-decoration: none;
                    }

                    .button:hover {
                        scale: 1.02;
                    }

                </style>
                </head>
                <body>
                    <h1> Confirm Your Email Address </h1>
                    <p> Click on the button below to confirm your email address with Study Buddy. If you didn't create an account with 
                        <a href="https://salmon-wave-0f89c260f.4.azurestaticapps.net/index.html">StudyBuddy</a>,
                        you can safely delete this email.
                    </p>
                    <a class="button" href="https://salmon-wave-0f89c260f.4.azurestaticapps.net/verify.html?token=${token}"> Click to Verify Email </a>
                </body>
        `
    }

    try {
        await sgMail.send(msg);
        console.log(`Successfully send message to ${firstName}`);
    } catch (e) {
        console.error(e);
    }
}

module.exports = { sendVerificationEmail };