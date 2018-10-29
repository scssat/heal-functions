import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
//import * as _ from 'lodash'; //NiU, but will be used to create chunks/batches
const db = admin.firestore();
import * as shared from '../collections';

export const postCreate = functions.firestore
  .document(`${shared.MBH_FORUM}/{id}`)
  .onCreate(async (snap, context) => {
    const post = snap.data();

    const forumGroupRef = db
      .collection(shared.FORUM_GROUPS)
      .doc(post.forumGroup);

    await forumGroupRef
      .get()
      .then(querySnapshot => {
        const forumGroup = querySnapshot.data();
        forumGroup.numberOf++;

        forumGroupRef
          .update(forumGroup)
          .catch(err =>
            console.log('ERROR - UPDATING FORUM GROUP (post create):', err)
          );
      })
      .catch(err =>
        console.log('Error reding FOLLOW USER, (post create)', err)
      );

    const forumGroupFollwersRef = db
      .collection(shared.FORUM_GROUPS)
      .where('followedGroup', '==', post.forumGroup);

    return db
      .runTransaction(transaction => {
        return transaction
          .get(forumGroupFollwersRef)
          .then(followerData => {
            followerData.forEach(doc => {
              const followerRelationship = doc.data();
              // CREATE NOTIFICATION
              if (doc.data().size > 500) {
                // Transaction must be split into chunks or batches.
                console.log(
                  'Forum group notification is not complete, number of followers > 500'
                );
              }

              const notRef = db.collection(
                `users/${followerRelationship.followerid}/notifications`
              );

              const notification = {
                created: new Date(),
                from: 'Forum:' + post.forumGroup,
                description: 'Ny post på forum:' + post.title,
                type: shared.NotificationTypesNo.Forum,
                link: '',
                id: ''
              };

              createNotification(notification, notRef).catch(err => {
                console.log(`Error - create notifications! - ${err}`);
              });
            });
          })
          .catch(err => {
            console.log(`Error updating forum groups! - ${err}`);
          });
      })
      .then(() => {
        console.log('Transaction uupdate successfully completed!');
      })
      .catch(err => {
        console.log(`Error in transaction updating forum group! - ${err}`);
      });
  });

async function createNotification(notification, notRef: any) {
  await notRef
    .add(notification)
    .catch(err =>
      console.log('ERROR - Creating notification (create post):', err)
    );
}
