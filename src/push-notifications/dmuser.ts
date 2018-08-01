import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as mbhCollection from '../collections';
//admin.initializeApp(functions.config().firebase);

export const sendDMmessageNotification = functions.firestore
  .document(
    `users/{userId}/${mbhCollection.DM_USERS}/{useridForum}/${
      mbhCollection.DM_MESSAGES
    }/{dmMessageId}`
  )
  .onCreate((snap, context) => {
    const dmMessage = snap.data();
    const displayUser = dmMessage.sendDisplayUser;
    const email = context.params.userId;
    const dmMessageId = context.params.dmMessageId;

    const payload = {
      notification: {
        title: `Ny direkte melding fra ${displayUser}`,
        body: dmMessage.messagesubstring(0, 50),
        icon: '//https://placeimg.com/200/200/any'
      }
    };

    // ref to the parent document
    const db = admin.firestore();

    const notRef = db.collection(`users/${email}/notifications`);
    // get users tokens and send notifications

    const notification = {
      created: new Date(),
      from: displayUser,
      decription: `Ny direkte melding fra ${displayUser}`,
      type: 'dmMessage',
      link: `sendmessages/dm`,
      id: dmMessageId
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
        userRef
          .update(user)
          .catch(err => console.log('Error when updating user', err));

        console.log('Notification sendt to user:', email);
        return admin.messaging().sendToDevice(tokens, payload);
      })
      .catch(err => console.log(err));

    return null;
  });
