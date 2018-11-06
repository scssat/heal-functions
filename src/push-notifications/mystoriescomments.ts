import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as shared from '../collections';
const db = admin.firestore();

export const storyCommentNotification = functions.firestore
  .document('mystories/{storyId}/comments/{commentId}')
  .onCreate(async (snap, context) => {
    const comment = snap.data();
    const displayUser = comment.author;
    const storyId = context.params.storyId;

    if (comment.owner) {
      return null;
    }
    // Message details for end user

    const notRef = db.collection(`users/${comment.storyOwner}/notifications`);

    const notification = {
      created: new Date(),
      from: displayUser,
      description: 'Ny kommentar til historie er opprettet',
      type: shared.NotificationTypesNo.MyStoryComment,
      link: '/mysociety/myhistories',
      id: storyId
    };

    return notRef
      .add(notification)
      .catch(err => console.error('ERROR - Creating notification:', err));
  });
