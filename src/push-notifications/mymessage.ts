import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as mbhCollection from '../collections';
//admin.initializeApp(functions.config().firebase);

export const sendinternalMessageNotification = functions.firestore
  .document(`users/{userId}/${mbhCollection.MY_INCOMMING_MESSAGES}/{messageId}`)
  .onCreate((snap, context) => {
    const message = snap.data();
    const title = message.title;
    const email = context.params.userId;
    const messageId = context.params.messageId;

    const payload = {
      notification: {
        title: 'Ny post fra MinBehandling sentral!',
        body: `MinBehandling Sentral har sendt ny post til deg`,
        icon: '//https://placeimg.com/200/200/any'
      }
    };

    // ref to the parent document
    const db = admin.firestore();

    const notRef = db.collection(`users/${email}/notifications`);
    // get users tokens and send notifications

    const notification = {
      created: new Date(),
      from: 'MinBehandling Sentral',
      decription: title,
      type: 'InternalEmail',
      link: `sendmessages/editsendmessage/${messageId}`,
      id: messageId
    };

    notRef
      .add(notification)
      .catch(err => console.log('ERROR - Creating notification:', err));

    const userRef = db.collection('users').doc(email);

    userRef
      .get()
      .then(snapshot => snapshot.data())
      .then(user => {
        const tokens = user.fcmTokens ? Object.keys(user.fcmTokens) : [];

        if (!tokens.length) {
          throw new Error('User does not have any tokens!');
        }

        user.numberOfNotifications = 1;
        user.numberOfEmails = 1;
        userRef
          .update(user)
          .catch(err => console.log('Error when updating user', err));

        console.log('Notification sendt to user:', email);
        return admin.messaging().sendToDevice(tokens, payload);
      })
      .catch(err => console.log(err));

    return null;
  });
