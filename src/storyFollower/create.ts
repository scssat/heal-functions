import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
const db = admin.firestore();
import * as shared from '../collections';

export const storyFollowerCreate = functions.firestore
  .document(`${shared.FOLLOWER_STORY}/{id}`)
  .onCreate(async (snap, context) => {
    const storyFollow = snap.data();

    const docRef = db.collection('users').doc(storyFollow.followedid);
    docRef
      .get()
      .then(querySnapshot => {
        const user = querySnapshot.data();
        user.storyFollowers++;
        docRef.update(user);
      })
      .catch(err =>
        console.log('Error reding USER, (storyFollowerCreate)', err)
      );
  });
