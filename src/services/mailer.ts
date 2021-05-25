import User from '../entity/User';
import sgMail from '@sendgrid/mail';
import Meeting from '../entity/Meeting';
import UserParticipationStatus from '../entity/UserParticipationStatus';

export const sendMeetingInvitationMail = (
  participants: User[],
  meeting: Meeting,
  invitationLink: string
) => {
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
    (result) => {
      console.log('Sent email');
    },
    (err) => {
      console.error(err);
    }
  );
};
