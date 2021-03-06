import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as shared from '../collections';
const db = admin.firestore();

export const internalMessageNotification = functions.firestore
  .document(`users/{userId}/${shared.MY_INCOMMING_MESSAGES}/{messageId}`)
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const title = message.title;
    const uid = context.params.userId;
    const messageId = context.params.messageId;

    const notRef = db.collection(`users/${uid}/notifications`);
    const notification = {
      created: new Date(),
      from: 'HEAL Sentral',
      description: 'Intern mail:' + title,
      type: shared.NotificationTypesNo.InternalEmail,
      link: `sendmessages/editsendmessage/${messageId}`,
      id: messageId
    };

    return notRef.add(notification).catch(err => console.error('ERROR - Creating notification:', err));
  });
