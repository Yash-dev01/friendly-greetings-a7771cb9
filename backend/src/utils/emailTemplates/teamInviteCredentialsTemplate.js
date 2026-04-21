export const teamInviteCredentialsTemplate = ({
  fullName,
  email,
  tempPassword,
  teamName,
  durationDays,
  expiresAt,
  loginUrl = 'https://alumni-connect-01.netlify.app/login',
}) => `
  <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:24px;">
    <div style="max-width:620px; margin:auto; background:#ffffff; padding:28px; border-radius:12px; box-shadow:0 4px 14px rgba(0,0,0,0.06);">
      <h2 style="color:#1d3557; text-align:center; margin:0 0 8px;">🎉 Welcome to the ${teamName} team</h2>
      <p style="text-align:center; color:#52606d; margin:0 0 24px;">on Alumni Connect</p>

      <p style="font-size:15px; color:#222;">
        Hi <strong>${fullName || email}</strong>,<br/><br/>
        You've been granted temporary team access on Alumni Connect to help moderate
        and assist with platform operations.
      </p>

      <div style="background:#eef2f7; border-radius:8px; padding:16px; margin:18px 0;">
        <p style="margin:0 0 8px; font-size:14px; color:#1d3557;"><strong>Your temporary credentials</strong></p>
        <p style="margin:0; font-size:14px;">Email: <strong>${email}</strong></p>
        <p style="margin:0; font-size:14px;">Password: <strong>${tempPassword}</strong></p>
      </div>

      <div style="background:#fff8e1; border-left:4px solid #f1c40f; padding:12px 14px; border-radius:6px; margin:14px 0; font-size:14px; color:#5d4a00;">
        ⏳ This access is valid for <strong>${durationDays} days</strong>${
  expiresAt
    ? ` and will expire on <strong>${new Date(expiresAt).toDateString()}</strong>`
    : ''
}.
      </div>

      <div style="text-align:center; margin-top:24px;">
        <a href="${loginUrl}" style="background:#1d3557; color:#fff; padding:12px 22px; border-radius:8px; text-decoration:none; font-weight:600;">
          Login to Team Workspace
        </a>
      </div>

      <p style="font-size:12px; color:#888; margin-top:28px; text-align:center;">
        Please change your password after your first login. After the access period ends,
        your account will revert to its original role automatically.
      </p>
    </div>
  </div>
`;
