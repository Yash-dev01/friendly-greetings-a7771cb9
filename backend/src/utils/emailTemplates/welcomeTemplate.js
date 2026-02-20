export const welcomeEmailTemplate = (name) => `
  <div style="font-family: Arial, sans-serif; background: #dfded4f7; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: white; padding: 25px; border-radius: 10px;">
      
      <h2 style="color: #b74b66ff; text-align: center;">🎉 Welcome to Alumni Connect!</h2>

      <p style="font-size: 16px; color: #333;">
        Hi <strong>${name}</strong>,<br><br>
        We're excited to have you join our Alumni Connect community!
      </p>

      <div style="text-align: center; margin: 20px 0;">
        <a href="https://alumnni-connect.netlify.app/"
          style="background: #b74b4bff; padding: 12px 20px; color: white; text-decoration: none; border-radius: 6px;">
          Login to Your Account
          Password : name+birthyear 
          for example name = xyz dob = dd/mm/yyyy
          passowrd : xyzyyyy
        </a>
      </div>

      <p style="font-size: 15px; color: #555;">
        If you have any questions, just reply to this email – we're always happy to help!
      </p>

      <p style="margin-top: 30px; font-size: 14px; color: #777777ff;">
        Regards,<br>
        <strong>Alumni Connect Team</strong>
      </p>

    </div>
  </div>
`;
