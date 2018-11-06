// Remember to delete COMMENTS
// Reduce forumGroups with 1

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
const db = admin.firestore();
import * as shared from '../collections';
import * as algoliasearch from 'algoliasearch';

// Initialize the Algolia Client
const env = functions.config();
const client = algoliasearch(env.algolia.appid, env.algolia.apikey);
const index = client.initIndex('forumPosts');

// This function includes push notification to the followed user

export const postDelete = functions.firestore
  .document(`${shared.MBH_FORUM}/{id}`)
  .onDelete(async (snap, context) => {
    const id = context.params.id;
    const objectId = context.params.id;
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
          .catch(err => console.error('ERROR - UPDATING FORUM GROUP:', err));
      })
      .catch(err =>
        console.error('Error reding FOLLOW USER, (postDelete)', err)
      );

    const commentRef = db.collection(
      `${shared.MBH_FORUM}/${id}/${shared.MBH_FORUM_COMMENTS}`
    );

    index
      .deleteObject(objectId)
      .catch(err =>
        console.error('Error deleting Algolia search, (postDelete)', err)
      );

    return commentRef
      .get()
      .then(commentData => {
        deleteComment(commentData, id).catch(err =>
          console.error('Error deleting COMMENTS, (postDelete)', err)
        );
      })
      .catch(err => console.log('Error reading COMMENTS, (postDelete)', err));
  });

async function deleteComment(commentRef: any, id: string) {
  commentRef.forEach(comment => {
    db.collection(`${shared.MBH_FORUM}/${id}/${shared.MBH_FORUM_COMMENTS}`)
      .doc(comment.id)
      .delete()
      .catch(err => console.error('ERROR - Deleting comment:', err));
  });
}
