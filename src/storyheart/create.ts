import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
const db = admin.firestore();
import * as shared from '../collections';

export const storyHeartCreate = functions.firestore
  .document(`${shared.STORY_HEARTS}/{heartId}`)
  .onCreate((snap, context) => {
    const storyHeart = snap.data();

    const docRef = db.collection(shared.MY_STORIES).doc(storyHeart.storyId);
    docRef
      .get()
      .then(querySnapshot => {
        const mystory = querySnapshot.data();
        mystory.numberOfHearts++;
        docRef.update(mystory);
      })
      .catch(err =>
        console.error('Error reding STORY, (storyHeartCreate)', err)
      );
    console.log('Story HEART created!');
    return null;
  });
