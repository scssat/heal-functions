import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
const db = admin.firestore();
import * as shared from '../collections';

export const postHeartDelete = functions.firestore
  .document(`${shared.FORUM_HEARTS}/{heartId}`)
  .onDelete(async (snap, context) => {
    const postHeart = snap.data();

    const docRef = db.collection(shared.MBH_FORUM).doc(postHeart.postId);
    docRef.get().then(querySnapshot => {
      let post = querySnapshot.data();
      post.numberOfHearts--;
      docRef.delete(post);
    });
  });
