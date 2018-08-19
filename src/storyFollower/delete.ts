import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
const db = admin.firestore();
import * as shared from '../collections';

export const storyFollowerDelete = functions.firestore
  .document(`${shared.FOLLOWER_STORY}/{id}`)
  .onCreate(async (snap, context) => {
    const storyFollow = snap.data();

    const docRef = db.collection('users').doc(storyFollow.followedid);
    return docRef
      .get()
      .then(querySnapshot => {
        const user = querySnapshot.data();
        user.storyFollowers--;
        docRef.update(user);
        console.log('Story follower deleted & user updated!');
      })
      .catch(err =>
        console.log('Error reding USER, (storyFollowerDelete)', err)
      );
  });
