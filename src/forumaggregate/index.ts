const functions = require('firebase-functions');
const admin = require('firebase-admin');
import * as mbhCollection from '../collections';

export const aggregateComments = functions.firestore
  .document(`${mbhCollection.MBH_FORUM_COMMENTS}/{commentId}`)
  .onWrite((snap, event) => {
    const comment = snap.data();

    // ref to the parent document
    const postRef = admin
      .firestore()
      .collection(`${mbhCollection.MBH_FORUM}`)
      .doc(comment.postId);

    const commentRef = admin
      .firestore()
      .collection(`${mbhCollection.MBH_FORUM_COMMENTS}`);

    // get all comments and aggregate
    return commentRef
      .orderBy('created', 'desc')
      .get()
      .then(querySnapshot => {
        // get the total comment count
        const commentCount = querySnapshot.size;

        const recentComments = [];

        // add data from the 20 most recent comments to the array
        querySnapshot.forEach(doc => {
          recentComments.push(doc.data());
        });

        recentComments.splice(20);

        // record last comment timestamp
        const lastActivity = recentComments[0].created;

        // data to update on the document
        const data = { commentCount, recentComments, lastActivity };

        // run update
        return postRef.update(data);
      })
      .catch(err => console.log('Error when writing to post', err));
  });
