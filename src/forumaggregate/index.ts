const functions = require('firebase-functions');
const admin = require('firebase-admin');
import * as mbhCollection from '../collections';
const db = admin.firestore();

export const aggregateComments = functions.firestore
  .document(`${mbhCollection.MBH_FORUM_COMMENTS}/{commentId}`)
  .onWrite((change, context) => {
    const comment = change.after.data();

    if (!change.after.exists) {
      // Document has been deleted
      return null;
    }

    // ref to the parent document
    const postRef = db.collection('forumposts').doc(comment.forumPostId);

    const commentRef = db.collection(`${mbhCollection.MBH_FORUM_COMMENTS}`);

    // get all comments and aggregate
    return commentRef
      .where('forumPostId', '==', comment.forumPostId)
      .orderBy('created', 'desc')
      .get()
      .then(querySnapshot => {
        // get the total comment count
        const numberOfComments = querySnapshot.size;

        let recentComments = [];

        // add data from the 10 most recent comments to the array
        querySnapshot.forEach(doc => {
          recentComments.push(doc.data());
        });

        recentComments = [...recentComments.slice(0, 9)];

        // record last comment timestamp
        const lastUpdate = recentComments[0].created;

        // data to update on the document
        const data = { numberOfComments, recentComments, lastUpdate };
        // run update
        console.log('POSTs comments aggreated!');
        return postRef
          .update(data)
          .catch(err => console.log('Error when writing to post', err));
      })
      .catch(err => console.log('Error when reading comments', err));
  });
