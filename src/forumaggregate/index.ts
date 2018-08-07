const functions = require('firebase-functions');
const admin = require('firebase-admin');
import * as mbhCollection from '../collections';

export const aggregateComments = functions.firestore
  .document(`${mbhCollection.MBH_FORUM_COMMENTS}/{commentId}`)
  .onWrite((change, event) => {
    const comment = change.after.data();

    // ref to the parent document
    const postRef = admin
      .firestore()
      .collection('forumposts')
      .doc(comment.forumPostId);

    const commentRef = admin
      .firestore()
      .collection(`${mbhCollection.MBH_FORUM_COMMENTS}`);

    console.log(comment.forumPostId);
    // get all comments and aggregate
    commentRef
      .where('forumPostId', '==', comment.forumPostId)
      .orderBy('created', 'desc')
      .get()
      .then(querySnapshot => {
        // get the total comment count
        const numberOfComments = querySnapshot.size + 1;

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
        console.log('Number of comments:', numberOfComments);
        // run update
        return postRef
          .update(data)
          .catch(err => console.log('Error when writing to post', err));
      })
      .catch(err => console.log('Error when reading comments', err));
    return null;
  });
