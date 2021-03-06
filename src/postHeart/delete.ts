import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
const db = admin.firestore();
import * as shared from '../collections';

export const postHeartDelete = functions.firestore
  .document(`${shared.MBH_FORUM_HEARTS}/{heartId}`)
  .onDelete(async (snap, context) => {
    const postHeart = snap.data();

    const docRef = db.collection(shared.MBH_FORUM).doc(postHeart.postId);
    return docRef
      .get()
      .then(querySnapshot => {
        const post = querySnapshot.data();
        post.numberOfHearts--;
        docRef.delete(post);
        console.log('POST HEART deleted!');
      })
      .catch(err => console.error('Error reding POST, (postHeartDelete)', err));
  });
