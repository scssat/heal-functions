import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as algoliasearch from 'algoliasearch';

// Initialize the Algolia Client
const env = functions.config();
const client = algoliasearch(env.algolia.appid, env.algolia.apikey);
const index = client.initIndex('forumPosts');

import * as _ from 'lodash';
const db = admin.firestore();
import * as shared from '../collections';

export const postCreate = functions.firestore
  .document(`${shared.MBH_FORUM}/{id}`)
  .onCreate(async (snap, context) => {
    const post = snap.data();
    const objectID = snap.id;
    //const id = context.params.id;

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
            console.error('ERROR - UPDATING FORUM GROUP (post create):', err)
          );
      })
      .catch(err =>
        console.error('Error reading FOLLOW USER, (post create)', err)
      );

    const notification = {
      created: Date.now(),
      from: 'Forum:' + post.forumGroup,
      description: 'Ny post på forum:' + post.title,
      type: shared.NotificationTypesNo.Forum,
      link: '',
      id: ''
    };

    try {
      const groupFollowers = await getUserFollowersIds(post.forumGroup);
      if (groupFollowers.length > 0) {
        //Generate the right amount of batches
        const batches = _.chunk(groupFollowers, shared.MAX_BATCH_SIZE).map(
          userIds => {
            const writeBatch = db.batch();
            userIds.forEach(userId => {
              const notifid =
                userId +
                '_' +
                post.forumGroup +
                '_' +
                new Date().getTime().toString();
              writeBatch.set(
                db
                  .collection('users')
                  .doc(userId)
                  .collection('notifications')
                  .doc(notifid),
                notification
              );
            });
            return writeBatch.commit();
          }
        );

        await Promise.all(batches);
        console.log('The feed of ', groupFollowers.length, ' have been update');
      }
    } catch (err) {
      console.error(
        'Failed updating follwed users group:',
        post.forumGroup,
        'with error:',
        err
      );
    }

    // Add the data to the algolia index
    const searchContent = {
      displayUser: post.displayUser,
      hashTags: post.hashTags,
      title: post.title,
      forumGroup: post.forumGroup,
      content: post.strippedContent
    };

    return index
      .addObject({
        objectID,
        ...searchContent
      })
      .catch(err => console.log('Error when creating Algolia index', err));
  });

async function getUserFollowersIds(forumGroup: string): Promise<string[]> {
  const forumGroupFollwersRef = db
    .collection(shared.FORUM_GROUPS)
    .where('followedGroup', '==', forumGroup);
  const followers = await forumGroupFollwersRef.get();
  return followers.docs.map(followerSnapshot => followerSnapshot.id);
}
