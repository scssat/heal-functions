// Remember to delete COMMENTS
// Reduce forumGroups with 1

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
const db = admin.firestore();
import * as shared from '../collections';
// This function includes push notification to the followed user

export const postDelete = functions.firestore
  .document(`${shared.MBH_FORUM}/{id}`)
  .onDelete(async (snap, context) => {
    const id = context.params.id;
    const post = snap.data();

    const forumGroupRef = db
      .collection(shared.FORUM_GROUPS)
      .doc(post.forumGroup);

    await forumGroupRef
      .get()
      .then(querySnapshot => {
        const forumGroup = querySnapshot.data();
        forumGroup.numberOf--;

        forumGroupRef
          .update(forumGroup)
          .catch(err => console.log('ERROR - UPDATING FORUM GROUP:', err));
      })
      .catch(err => console.log('Error reding FOLLOW USER, (postDelete)', err));

    const commentRef = db.collection(
      `${shared.MBH_FORUM}/${id}/${shared.MBH_FORUM_COMMENTS}`
    );

    return commentRef
      .get()
      .then(commentData => {
        deleteComment(commentData, id).catch(err =>
          console.log('Error deleting COMMENTS, (postDelete)', err)
        );
      })
      .catch(err => console.log('Error reading COMMENTS, (postDelete)', err));
  });

async function deleteComment(commentRef: any, id: string) {
  commentRef.forEach(comment => {
    db.collection(`${shared.MBH_FORUM}/${id}/${shared.MBH_FORUM_COMMENTS}`)
      .doc(comment.id)
      .delete()
      .catch(err => console.log('ERROR - Deleting comment:', err));
  });
}
