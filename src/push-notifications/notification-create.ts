import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
const db = admin.firestore();

export const sendPushNotification = functions.firestore
  .document('users/{userid}/notifications/{id}')
  .onCreate((snap, context) => {
    const notificationData = snap.data();
    const userid = context.params.userid;

    // Message details for end user
    const payload = {
      notification: {
        title: 'MELDING',
        body: `Fra ${notificationData.from} - ${notificationData.decsription}`,
        icon: '//https://placeimg.com/200/200/any'
      }
    };

    const userRef = db.collection('users').doc(userid);

    return userRef
      .get()
      .then(snapshot => snapshot.data())
      .then(user => {
        const tokens = user.fcmTokens ? Object.keys(user.fcmTokens) : [];

        if (!tokens.length) {
          throw new Error('User does not have any tokens!');
        }

        user.numberOfNotifications++;
        userRef
          .update(user)
          .catch(err => console.error('Error when updating user', err));

        console.log('Notification sent to user:', userid);
        return admin.messaging().sendToDevice(tokens, payload);
      })
      .catch(err => console.error(err));
  });
