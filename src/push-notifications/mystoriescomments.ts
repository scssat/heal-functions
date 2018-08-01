import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
//admin.initializeApp(functions.config().firebase);

export const sendStoryNotification = functions.firestore
  .document('mystories/{storyId}/comments/{commentId}')
  .onCreate((snap, context) => {
    const comment = snap.data();
    const displayUser = comment.author;
    const storyId = context.params.storyId;

    if (!comment.owner) {
      // Message details for end user
      const payload = {
        notification: {
          title: 'Ny post fra familen!',
          body: `${displayUser} har opprettet ny post til deg`,
          icon: '//https://placeimg.com/200/200/any'
        }
      };

      // ref to the parent document
      const db = admin.firestore();

      const storyRef = db.collection('mystories').doc(storyId);
      // get users tokens and send notifications
      return storyRef
        .get()
        .then(snapshot1 => snapshot1.data())
        .then(story => {
          const notificationEmail = story.userid;
          const notRef = db.collection(
            `users/${notificationEmail}/notifications`
          );
          const notification = {
            created: new Date(),
            from: displayUser,
            decription: 'Ny kommentar til historie er opprettet',
            type: 'MyStoryComment',
            link: '/mysociety/myhistories',
            id: storyId
          };

          notRef
            .add(notification)
            .catch(err => console.log('ERROR - Creating notification:', err));

          const userRef = db.collection('users').doc(story.userid);

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

              console.log('Notification sendt to user:', notificationEmail);
              return admin.messaging().sendToDevice(tokens, payload);
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    }
    return true;
  });
