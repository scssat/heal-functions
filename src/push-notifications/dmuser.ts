import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as mbhCollection from '../collections';
const db = admin.firestore();

export const dmUserNotification = functions.firestore
  .document(
    `users/{userId}/${mbhCollection.DM_USERS}/{useridForum}/${
      mbhCollection.DM_MESSAGES
    }/{dmMessageId}`
  )
  .onCreate(async (snap, context) => {
    const dmMessage = snap.data();
    const displayUser = dmMessage.sendDisplayUser;
    const email = context.params.userId;
    const dmMessageId = context.params.dmMessageId;

    const notRef = db.collection(`users/${email}/notifications`);
    // get users tokens and send notifications

    const notification = {
      created: new Date(),
      from: displayUser,
      description: `Ny direkte melding fra ${displayUser}`,
      type: 'dmMessage',
      link: `sendmessages/dm`,
      id: dmMessageId
    };

    console.log('Internal mail notification created!');

    return notRef
      .add(notification)
      .catch(err => console.log('ERROR - Creating notification:', err));
  });
