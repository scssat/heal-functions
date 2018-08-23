import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as shared from '../collections';
const db = admin.firestore();

// Create a notification if on the RECEIVER side of the DM
// Create a new dm user if NO communication has occurred.

export const dmSendMessage = functions.firestore
  .document('users/{userid}/dmusers/{dmuserid}/dmmessages/{id}')
  .onCreate(async (snap, context) => {
    const dmMessage = snap.data();

    console.log('DM Create start');
    // Return if notification is created or message is sent.
    if (dmMessage.sent) {
      console.log('DM is sent, no change');
      return null;
    }

    const dmMessageId = context.params.id;
    const fromUserId = dmMessage.fromUserId;
    const toUserId = dmMessage.fromUserId;
    const dmUserId = dmMessage.displayUser;
    const ownerId = dmMessage.toUserId;
    const displayUser = dmMessage.displayUser;
    dmMessage.sent = true;

    // Check if user is sending to himself
    if (dmMessage.fromUserId === dmMessage.toUserId) {
      console.log('Sender = receiver, no change');
      return null;
    }

    // Check if user is sending to himself

    // Create the SENT DM
    const sendDM = {
      message: dmMessage.text,
      id: '',
      fromUserId: dmMessage.fromUserId,
      ownerId: dmMessage.toUserId,
      sent: true,
      toUserId: dmMessage.toUserId,
      displayUser: dmMessage.sendDisplayUser,
      avatar: dmMessage.sendAvatar,
      createdAt: dmMessage.createdAt
    };

    // Check if this is the first message
    const dmUserRef = db
      .collection(`users/${dmUserId}/dmusers`)
      .doc(dmMessage.sendDisplayUser);
    const messageRef = dmUserRef.collection(
      `users/${dmUserId}/dmusers/${toUserId}`
    );

    const sendMessageRef = db.doc(
      `users/${sendDM.fromUserId}/dmusers/${
        dmMessage.sendDisplayUser
      }/dmmessages/${dmMessageId}`
    );

    return dmUserRef
      .get()
      .then(snapshot => {
        if (snapshot.data()) {
          messageRef
            .add(sendDM)
            .catch(err => console.log('ERROR - Creating DM Message:', err));
        } else {
          const newDMUser = {
            id: '',
            ownerId: ownerId,
            userId: dmMessage.fromUserId,
            email: dmMessage.fromUserId,
            displayUser: dmMessage.sendDisplayUser,
            firstMessage: new Date(),
            lastMessage: new Date(),
            avatar: dmMessage.sendAvatar
          };
          createDMUser(newDMUser, sendDM, messageRef).catch(err =>
            console.log('ERROR - createDMUser', err)
          );
        }

        sendMessageRef
          .update(dmMessage)
          .catch(err => console.log('ERROR - Update DM message', err));

        // get users tokens and send notifications
        const notRef = db.collection(`users/${toUserId}/notifications`);

        const notification = {
          created: new Date(),
          from: displayUser,
          description: 'Ny medling fra bruker ' + displayUser,
          type: shared.NotificationTypesNo.DirectMessage,
          link: '/sendmessages/dm',
          id: fromUserId
        };

        notRef
          .add(notification)
          .catch(err => console.log('ERROR - Creating notification:', err));

        console.log('DM create execution complete.');
      })
      .catch(err => console.log(err));
  });

async function createDMUser(newDMUser, sendDM, messageRef) {
  await db
    .collection(`users/${newDMUser.toUserId}/dmusers`)
    .doc(newDMUser.sendDisplayUser)
    .set(newDMUser)
    .catch(err => console.log('ERROR - Creating DM USER:', err));

  await messageRef
    .add(sendDM)
    .catch(err => console.log('ERROR - Creating DM Message:', err));
}
