import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
const db = admin.firestore();
import * as shared from '../collections';
// This function includes push notification to the followed user

export const storyFollowerCreate = functions.firestore
  .document(`${shared.FOLLOWER_STORY}/{id}`)
  .onCreate(async (snap, context) => {
    const storyFollow = snap.data();
    const id = context.params.id;
    const followUserRef = db.collection('users').doc(storyFollow.followedid);
    const followedRef = db.collection(`${shared.FOLLOWER_STORY}`).doc(id);

    return followUserRef
      .get()
      .then(querySnapshot => {
        const followerUser = querySnapshot.data();
        const followerDisplayUser = followerUser.useridForum;

        storyFollow.displayFollwedUser = followerDisplayUser;
        storyFollow.followedAvatar = followerUser.avatarExt;

        followedRef
          .update(storyFollow)
          .catch(err =>
            console.log('ERROR - UPDATING follow relationship:', err)
          );

        // CREATE NOTIFICATION
        const notRef = db.collection(
          `users/${storyFollow.followedid}/notifications`
        );

        const notification = {
          created: new Date(),
          from: followerDisplayUser,
          description: 'Ny følger av dine historier:' + followerDisplayUser,
          type: shared.NotificationTypesNo.StoryFollower,
          link: '',
          id: ''
        };

        console.log(
          'Story follower created, notification CREATED & user updated!'
        );

        notRef
          .add(notification)
          .catch(err => console.error('ERROR - Creating notification:', err));
      })
      .catch(err =>
        console.error('Error reding FOLLOW USER, (storyFollowerCreate)', err)
      );
  });
