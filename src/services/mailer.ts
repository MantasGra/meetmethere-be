import User from '../entity/User';
import sgMail from '@sendgrid/mail';
import Meeting from '../entity/Meeting';

export const sendMeetingInvitationMail = (
  participants: User[],
  meeting: Meeting,
  invitationLink: string
): void => {
  if (process.env.ENVIRONMENT !== 'PROD') {
    console.log('Email not sent. It was skipped.');
    return;
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const mail = {
    to: participants.map((participant) => participant.email),
    from: process.env.MAILER_EMAIL,
    subject: 'Meeting Invitation | ' + meeting.name,
    text: 'You have been invited to a meeting',
    html: `<h1>You have been invited to a meeting "${meeting.name}"</h1><br/>
        <p>Check out your invitations page <a href="${invitationLink}">here</a></p>`
  };
  sgMail.sendMultiple(mail).then(
    () => {
      console.log('Sent email');
    },
    (err) => {
      console.error(err);
    }
  );
};

export const sendPasswordResetMail = (
  email: string,
  resetLink: string
): void => {
  if (process.env.ENVIRONMENT !== 'PROD') {
    console.log(`Email not sent. It was skipped. Reset link: ${resetLink}`);
    return;
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const mail = {
    to: email,
    from: process.env.MAILER_EMAIL,
    subject: 'Password reset request',
    text: `Your password reset link: ${resetLink}`,
    html: `
      <h1>You have request a password reset</h1>
      <br />
      <p>Please follow <a href="${resetLink}">this link</a> to reset your password.</p>
      <p>If you did not request this you can ignore this email.</p>
    `
  };

  sgMail.sendMultiple(mail).then(
    () => {
      console.log('Sent email');
    },
    (err) => {
      console.error(err);
    }
  );
};
