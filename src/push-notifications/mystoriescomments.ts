import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
//admin.initializeApp(functions.config().firebase);

export const sendStoryNotification = functions.firestore
  .document('mystories/{storyId}/comments/{commentId}')
  .onWrite((change, context) => {
    const comment = change.after.exists ? change.after.data() : null;
    const userEmail = comment.userid;
    const storyId = context.params.storyId;
    console.log('Notification to user:', userEmail);

    if (!comment.owner) {
      // Message details for end user
      const payload = {
        notification: {
          title: 'Ny post fra familen!',
          body: `${comment.userid} har opprettet ny post til deg`,
          icon: '//https://icons8.com/icon/65838/open-view-in-new-tab'
        }
      };

      // ref to the parent document
      const db = admin.firestore();
      const storyRef = db.collection('my').doc(storyId);
      const notRef = db.collection(`users/${userEmail}/notifications`);
      const notification = {
        created: new Date(),
        from: userEmail,
        decription: 'Ny kommentar til Min historie er opprettet',
        type: 'MyStoryComment',
        link: '/mysociety/myhistories',
        id: storyId
      };
      notRef
        .add(notification)
        .catch(err => console.log('ERROR - Create notification:', err));
      // get users tokens and send notifications
      return storyRef
        .get()
        .then(snapshot1 => snapshot1.data())
        .then(story => {
          const userRef = db.collection('users').doc(story.userid);
          userRef
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
        })
        .catch(err => console.log(err));
    }
    return true;
  });
