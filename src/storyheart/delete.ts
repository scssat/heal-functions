import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
const db = admin.firestore();
import * as shared from '../collections';

export const storyHeartDelete = functions.firestore
  .document(`${shared.STORY_HEARTS}/{heartId}`)
  .onDelete(async (snap, context) => {
    const storyHeart = snap.data();

    const docRef = db.collection(shared.MY_STORIES).doc(storyHeart.storyId);
    docRef.get().then(querySnapshot => {
      let mystory = querySnapshot.data();
      mystory.numberOfHearts--;
      docRef.update(mystory);
    });
  });
