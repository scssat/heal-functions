import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
const db = admin.firestore();

export const supportNotification = functions.firestore
  .document('users/{userEmail}/familyposts/{myfamId}')
  .onCreate(async (snap, context) => {
    const userEmail = context.params.userEmail;
    const post = snap.data();

    if (post.owner) {
      return null;
    }

    const notRef = db.collection(`users/${userEmail}/notifications`);

    const notification = {
      created: new Date(),
      from: 'post.author',
      description: 'Ny post fra en i din nære krets ' + post.author,
      type: 'support',
      link: '/mysociety/myfamily',
      id: ''
    };

    console.log('Support comment notification created!');

    return notRef
      .add(notification)
      .catch(err => console.log('ERROR - Create notification:', err));
  });
