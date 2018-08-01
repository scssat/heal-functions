import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
//admin.initializeApp(functions.config().firebase);

export const sendSupportNotification = functions.firestore
  .document('users/{userEmail}/familyposts/{myfamId}')
  .onCreate((snap, context) => {
    const userEmail = context.params.userEmail;
    const post = snap.data();
    console.log('Notification to user:', userEmail);

    if (!post.owner) {
      // Message details for end user
      const payload = {
        notification: {
          title: 'Ny post fra familen!',
          body: `${post.author} har opprettet ny post til deg`,
          icon: '//https://placeimg.com/200/200/any'
        }
      };

      // ref to the parent document
      const db = admin.firestore();
      const userRef = db.collection('users').doc(userEmail);
      const notRef = db.collection(`users/${userEmail}/notifications`);
      const notification = {
        created: new Date(),
        from: 'post.author',
        decription: 'Ny post fra en i din nære krets ' + post.author,
        type: 'support',
        link: '/mysociety/myfamily',
        id: ''
      };
      notRef
        .add(notification)
        .catch(err => console.log('ERROR - Create notification:', err));
      // get users tokens and send notifications
      return userRef
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

          console.log('Notification sendt to user:', userEmail);
          return admin.messaging().sendToDevice(tokens, payload);
        })
        .catch(err => console.log(err));
    }
    return true;
  });
