import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as shared from '../collections';
const db = admin.firestore();

export const internalMessageNotification = functions.firestore
  .document(`users/{userId}/${shared.MY_INCOMMING_MESSAGES}/{messageId}`)
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const title = message.title;
    const email = context.params.userId;
    const messageId = context.params.messageId;

    const notRef = db.collection(`users/${email}/notifications`);
    const notification = {
      created: new Date(),
      from: 'HEAL Sentral',
      description: 'Intern mail:' + title,
      type: shared.NotificationTypesNo.InternalEmail,
      link: `sendmessages/editsendmessage/${messageId}`,
      id: messageId
    };

    return notRef
      .add(notification)
      .catch(err => console.log('ERROR - Creating notification:', err));
  });
