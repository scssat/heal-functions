import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
const db = admin.firestore();
import * as shared from '../collections';
// This function includes push notification to the followed user

export const forumGroupFollowerCreate = functions.firestore
  .document(`${shared.MBH_FOLLOWER_FORUM}/{id}`)
  .onCreate(async (snap, context) => {
    const postFollow = snap.data();

    const forumGroupRef = db
      .collection(shared.FORUM_GROUPS)
      .doc(postFollow.followedGroup);

    return forumGroupRef
      .get()
      .then(querySnapshot => {
        const forumGroup = querySnapshot.data();
        forumGroup.numberOfFollowers++;

        forumGroupRef
          .update(forumGroup)
          .catch(err => console.error('ERROR - UPDATING FORUM GROUP:', err));
      })
      .catch(err =>
        console.error('Error reding FOLLOW USER, (forumGroupDelete)', err)
      );
  });
