import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
const db = admin.firestore();
import * as shared from '../collections';
import * as _ from 'lodash';

export const storyCreate = functions.firestore.document(`${shared.MY_STORIES}/{id}`).onCreate(async (snap, context) => {
  const story = snap.data();
  const storyid = context.params.id;

  const notification = {
    created: Date.now(),
    from: 'Historie/blog:' + story.displayUser,
    description: 'Ny post på forum:' + story.title,
    type: shared.NotificationTypesNo.MyStory,
    link: '/mysociety/myhistories',
    id: storyid
  };

  try {
    const storyFollowers = await getUserFollowersIds(story.userid);

    if (storyFollowers.length > 0) {
      //Generate the right amount of batches
      const batches = _.chunk(storyFollowers, shared.MAX_BATCH_SIZE).map(userIds => {
        const writeBatch = db.batch();
        userIds.forEach(userId => {
          const id = userId + '_' + storyid + '_' + new Date().getTime().toString();
          writeBatch.set(
            db
              .collection('users')
              .doc(userId)
              .collection('notifications')
              .doc(id),
            notification
          );
        });
        return writeBatch.commit();
      });

      await Promise.all(batches);
      console.log('The feed of story followers# ', storyFollowers.length, ' have been update');
    }
  } catch (err) {
    console.error('Failed updating story follwers error:', err);
  }
});

async function getUserFollowersIds(userid: string): Promise<string[]> {
  const forumGroupFollwersRef = db.collection(shared.FOLLOWER_STORY).where('followedid', '==', userid);
  const followers = await forumGroupFollwersRef.get();
  return followers.docs.map(followerSnapshot => followerSnapshot.id);
}
