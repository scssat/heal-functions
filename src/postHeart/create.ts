import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
const db = admin.firestore();
import * as shared from '../collections';

export const postHeartCreate = functions.firestore
  .document(`${shared.FORUM_HEARTS}/{heartId}`)
  .onCreate(async (snap, context) => {
    const postHeart = snap.data();

    const docRef = db.collection(shared.MBH_FORUM).doc(postHeart.postId);
    return docRef
      .get()
      .then(querySnapshot => {
        const post = querySnapshot.data();
        post.numberOfHearts++;
        docRef.update(post);
        console.log('POST HEART created!');
      })
      .catch(err => console.log('Error reding POST, (postHeartCreate)', err));
  });
