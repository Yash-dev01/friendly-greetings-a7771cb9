export const resetPasswordTemplate = (resetLink) => `
  <div style="font-family: Arial; background: #fafafa; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: white; padding: 25px; border-radius: 10px;">

      <h2 style="color: #e63946; text-align: center;">🔐 Reset Your Password</h2>

      <p style="font-size: 15px; color: #333;">
        We received a request to reset your password. Click the button below:
      </p>

      <div style="text-align: center; margin: 20px 0;">
        <a href="${resetLink}" style="
          background: #e63946; 
          padding: 12px 20px; 
          color: white;
          text-decoration: none; 
          border-radius: 6px;
        ">
          Reset Password
        </a>
      </div>

      <p style="font-size: 14px; color: #555;">
        If you didn't request this, you can safely ignore this email.
      </p>

    </div>
  </div>
`;
