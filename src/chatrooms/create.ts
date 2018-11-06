import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// This function keeps track of the length of the message
// trail, max messages = 200;

const db = admin.firestore();
const settings = { timestampsInSnapshots: true };
db.settings(settings);

export const archiveChat = functions.firestore
  .document('chatrooms/{chatId}')
  .onUpdate(change => {
    const data = change.after.data();

    // Max length of the message trail
    const maxLen = 200;
    const msgLen = data.messages.length;
    const charLen = JSON.stringify(data).length;

    const batch = db.batch();

    if (charLen >= 10000 || msgLen >= maxLen) {
      data.messages.splice(0, msgLen - maxLen);
      //console.log(data.messages.length);
      const ref = db.collection('chatrooms').doc(change.after.id);

      batch.set(ref, data, { merge: true });

      return batch.commit();
    } else {
      return null;
    }
  });
