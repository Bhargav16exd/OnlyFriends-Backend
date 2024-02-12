import { google } from "googleapis";
import nodemailer from "nodemailer";

export const sendMail = async (email, text) => {
    try {
        const oAuth2Client = new google.auth.OAuth2(
            process.env.OAUTH_CLIENTID,
            process.env.OAUTH_SECRETTOKEN,
            process.env.OAUTH_REDIRECTURL
        );

        oAuth2Client.setCredentials({ refresh_token: process.env.OAUTH_REFRESHTOKEN });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.OAUTH_EMAIL,
                clientId: process.env.OAUTH_CLIENTID,
                clientSecret: process.env.OAUTH_SECRETTOKEN,
                refreshToken: process.env.OAUTH_REFRESHTOKEN
            }
        });

        const mailOptions = {
            from: process.env.OAUTH_EMAIL,
            to: email,
            subject: "OTP",
         
            html:`   <div class="container" style="border: 1px solid black; padding: 2rem; background-color: #fffaf2; height: 100%; font-family: 'Manrope', sans-serif; ">
        <div class="logo" style="width: 100%; display: flex;
        justify-content: center; align-items: center;">
          
        </div>
        <div class="usergreeting" style="text-align: center; margin-top: 2rem; margin-bottom: 1rem;">
            <p style="text-decoration: none;">Hi <br> ${email}</p>  
        </div>

        <div class="otpsection" style="height: 20rem; margin-top: 3rem; border: 1px solid black; background-color: white; text-align: center; box-shadow: black 0px 0px 20px -10px;">
            <span style="display: flex; justify-content: center; margin-top: 3rem;"></span>
            <section>
                <p>Your OTP for Registration is</p>
                <h4 style="margin-top: 4rem; font-size: large;">${text}</h4>
            </section>

            <section style="font-size: x-small;"> <p style="margin-top: 3rem;">Enter this OTP in the OTP field in the registration form</p></section>
        </div>

        <div class="info" style="border: 1px solid black; height: fit-content; margin-top: 3rem; background-color: white; box-shadow: black 0px 0px 20px -10px; padding: 1rem; margin-bottom: 1rem;">
            <p style="text-align: center; font-size: small;">Conversations on OnlyFriends are completely anonymous and encrypted.</p>
        </div>
    </div>`
        };

        const info = await transporter.sendMail(mailOptions);
        return info;

    } catch (error) {
        console.log(error);
    }
};


