const functions = require('firebase-functions');
const admin = require('firebase-admin');
import * as mbhCollection from '../collections';
const db = admin.firestore();

export const aggregateStoryComments = functions.firestore
  .document(
    `${mbhCollection.MY_STORIES}/{storyId}/${
      mbhCollection.MY_COMMENTS
    }/{commentId}`
  )
  .onWrite((change, context) => {
    //const comment = change.after.data();
    const storyId = context.params.storyId;

    if (!change.after.exists) {
      // Document has been deleted
      return null;
    }

    // ref to the parent document
    const postRef = db.collection(mbhCollection.MY_STORIES).doc(storyId);

    const commentRef = db.collection(
      `${mbhCollection.MY_STORIES}/${storyId}/${mbhCollection.MY_COMMENTS}`
    );

    // get all comments and aggregate
    return commentRef
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
        console.log('Storycomments aggregated!');
        // run update
        return postRef
          .update(data)
          .catch(err => console.error('Error when writing to story', err));
      })
      .catch(err => console.error('Error when reading storycomments', err));
  });
