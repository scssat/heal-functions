import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
//admin.initializeApp(functions.config().firebase);

export const sendSupportNotification = functions.firestore
  .document(`users/{userEmail}/familyposts/{myfamId}`)
  .onWrite((change, context) => {
    const userEmail = context.params.userEmail;
    const post = change.after.exists ? change.after.data() : null;
    console.log('Notification to user:', userEmail);

    if (!post.owner) {
      // Message details for end user
      const payload = {
        notification: {
          title: 'Ny post fra familen!',
          body: `${post.userid} har opprettet ny post til deg`,
          icon: '//https://placeimg.com/200/200/any'
        }
      };

      // ref to the parent document
      const db = admin.firestore();
      const userRef = db.collection('users').doc(userEmail);
      const notRef = db.collection(`users/${userEmail}/notifications`);
      const notification = {
        created: new Date(),
        from: 'post.userid',
        decription: 'Støtte post',
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

          console.log('Notification sendt to user:', userEmail);
          return admin.messaging().sendToDevice(tokens, payload);
        })
        .catch(err => console.log(err));
    }
    return true;
  });
