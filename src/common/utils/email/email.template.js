export const emailTemplate = (otp, userName) => {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Saraha Verification Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; color: #333333;">

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f7f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                
                <table width="100%" max-width="600px" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    
                    <tr>
                        <td align="center" style="background-color: #1abc9c; padding: 30px 20px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px;">Saraha App</h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="font-size: 20px; color: #333333; margin-top: 0;">Verify your email address</h2>
                            <p style="font-size: 16px; line-height: 1.5; color: #555555;">
                                Hello ${userName},
                                <br><br>
                                Thank you for using <strong>Saraha App</strong>! To complete your login or registration, please use the verification code below. This code is valid for the next 10 minutes.
                            </p>

                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <div style="background-color: #f8f9fa; border: 1px dashed #1abc9c; border-radius: 6px; padding: 15px 30px; display: inline-block;">
                                            <span style="font-family: monospace; font-size: 32px; font-weight: bold; color: #1abc9c; letter-spacing: 5px;">
                                                ${otp}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <p style="font-size: 14px; line-height: 1.5; color: #777777;">
                                If you did not request this code, you can safely ignore this email. Someone might have typed your email address by mistake.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="background-color: #f8f9fa; padding: 20px; border-top: 1px solid #eeeeee;">
                            <p style="font-size: 12px; color: #999999; margin: 0;">
                                &copy; 2026 Saraha App. All rights reserved.
                            </p>
                            <p style="font-size: 12px; color: #999999; margin: 5px 0 0 0;">
                                Need help? <a href="mailto:support@saraha.app" style="color: #1abc9c; text-decoration: none;">Contact Support</a>
                            </p>
                        </td>
                    </tr>

                </table>
                </td>
        </tr>
    </table>

</body>
</html>`;
};
