    export const teamAddedTemplate = (name, email, password) => `
  <div style="font-family: Arial; background: #eef2f3; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: white; padding: 25px; border-radius: 10px;">

      <h2 style="color: #1d3557; text-align: center;">👥 You’ve been added to the Alumni Team</h2>

      <p style="font-size: 16px;">
        Hi <strong>${name}</strong>,<br><br>
        You have been successfully added to the Alumni Connect team.
      </p>

      <p style="font-size: 15px; margin: 20px 0;">
        <strong>Your Login Details:</strong><br>
        Email: <strong>${email}</strong><br>
        Temporary Password: <strong>${password}</strong>
      </p>

      <div style="text-align: center;">
        <a href="https://your-frontend-url.com/login"
          style="background: #1d3557; color: white; padding: 12px 18px; text-decoration: none; border-radius: 6px;">
          Login Now
        </a>
      </div>

      <p style="font-size: 13px; color: #888; margin-top: 30px;">
        Please change your password after logging in.
      </p>

    </div>
  </div>
`;
