import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
//admin.initializeApp(functions.config().firebase);

export const sendForumNotification = functions.firestore
  .document('forumcomments/{id}')
  .onCreate((snap, context) => {
    const comment = snap.data();
    const forumPostId = comment.forumPostId;
    const displayUser = comment.displayUser;
    //const id = context.params.id;

    // Check if user is commenting his own post
    if (!comment.owner) {
      // Message details for end user
      const payload = {
        notification: {
          title: 'Nytt svar på ditt innlegg!',
          body: `${displayUser} har svart på ditt innlegg.`,
          icon: '//https://placeimg.com/200/200/any'
        }
      };

      // ref to the parent document
      const db = admin.firestore();
      const forumRef = db.collection('forumposts').doc(forumPostId);

      // get users tokens and send notifications

      return forumRef
        .get()
        .then(snapshot1 => snapshot1.data())
        .then(post => {
          // Check if notification is on
          if (post.notifyOnAnswer) {
            const userRef = db.collection('users').doc(post.userid);
            const notificationEmail = post.userid;
            const notRef = db.collection(
              `users/${notificationEmail}/notifications`
            );

            const notification = {
              created: new Date(),
              from: displayUser,
              decription: 'Nytt svar på ditt innlegg på forum',
              type: 'ForumComment',
              link: '/forum/postcomment/' + forumPostId,
              id: forumPostId
            };

            notRef
              .add(notification)
              .catch(err => console.log('ERROR - Creating notification:', err));

            userRef
              .get()
              .then(snapshot => snapshot.data())
              .then(user => {
                const tokens = user.fcmTokens
                  ? Object.keys(user.fcmTokens)
                  : [];

                if (!tokens.length) {
                  throw new Error('User does not have any tokens!');
                }

                console.log('Notification sendt to user:', notificationEmail);
                return admin.messaging().sendToDevice(tokens, payload);
              })
              .catch(err => console.log(err));
          }
        })
        .catch(err => console.log(err));
    }
    return true;
  });
