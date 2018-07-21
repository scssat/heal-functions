import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { sendStoryNotification } from '../push-notifications/mystoriescomments';
//admin.initializeApp(functions.config().firebase);

// Create a notification if on the RECEIVER side of the DM
// Create a new dm user if NO communication has occurred.

export const dmSendMessage = functions.firestore
  .document('dmmessages/{id}')
  .onCreate((snap, context) => {
    const dmMessage = snap.data();

    // Return if notification is created or message is sent.
    if (dmMessage.sent) {
      console.log('DM is sent, no change');
      return null;
    }

    // Check if user is commenting his own post
    if (dmMessage.fromUserId !== dmMessage.ownerId) {
      console.log('Sender = receiver, no change');
      return null;
    }

    const id = context.params.id;
    const fromUserId = dmMessage.fromUserId;
    const userEmail = dmMessage.toUserId;
    const ownerId = dmMessage.toUserId;
    const displayUser = dmMessage.displayUser;
    dmMessage.sent = true;
    const db = admin.firestore();

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
    const dmUserRef = db.collection('dmusers').doc(fromUserId);

    dmUserRef
      .get()
      .then(snapshot => {
        if (snapshot.data()) {
          dmUserRef
            .collection('dmmessages')
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
            avatar: dmMessage.sendDisplayUser
          };

          db.collection('dmusers')
            .add(newDMUser)
            .catch(err => console.log('ERROR - Creating DM USER:', err));
          dmUserRef
            .collection('dmmessages')
            .add(sendDM)
            .catch(err => console.log('ERROR - Creating DM Message:', err));
        }

        // Message details for end user
        const payload = {
          notification: {
            title: 'Ny melding fra bruker!',
            body: `${displayUser} har send deg ny melding.`,
            icon: '//https://placeimg.com/200/200/any'
          }
        };

        // get users tokens and send notifications
        const userRef = db.collection('users').doc(userEmail);
        const notRef = db.collection(`users/${userEmail}/notifications`);

        const notification = {
          created: new Date(),
          from: displayUser,
          decription: 'Ny medling fra bruker ' + displayUser,
          type: 'DMmessage',
          link: '/sendmessages/dm',
          id: fromUserId
        };

        notRef
          .add(notification)
          .catch(err => console.log('ERROR - Creating notification:', err));

        userRef
          .get()
          .then(snapshot1 => snapshot1.data())
          .then(user => {
            const tokens = user.fcmTokens ? Object.keys(user.fcmTokens) : [];

            if (!tokens.length) {
              throw new Error('User does not have any tokens!');
            }

            console.log('DM notification sendt to user:', userEmail);
            return admin.messaging().sendToDevice(tokens, payload);
          })
          .catch(err => console.log(err));
        return db
          .doc(`dmmessages/${id}`)
          .update(dmMessage)
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
    return null;
  });
