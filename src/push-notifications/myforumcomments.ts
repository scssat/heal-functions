import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as shared from '../collections';
const db = admin.firestore();

export const forumCommentNotification = functions.firestore
  .document('forumcomments/{id}')
  .onCreate((snap, context) => {
    const comment = snap.data();
    const forumPostId = comment.forumPostId;
    const displayUser = comment.displayUser;
    //const id = context.params.id;

    // Check if user is commenting his own post
    if (comment.owner) {
      return null;
    }

    // Get users tokens and send notifications

    const notRef = db.collection(`users/${comment.postOwner}/notifications`);

    const notification = {
      created: new Date(),
      from: displayUser,
      description: 'Nytt svar på ditt innlegg på forum',
      type: shared.NotificationTypes.ForumComment,
      link: '/forum/postcomment/' + forumPostId,
      id: forumPostId
    };

    console.log('FORUM comment notification created!');

    return notRef
      .add(notification)
      .catch(err => console.error('ERROR - Creating notification:', err));
  });
