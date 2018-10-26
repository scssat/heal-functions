import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const db = admin.firestore();
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
const stripe = require('stripe')(firebaseConfig.stripe.testkey);

export const userUpdate = functions.firestore
  .document('users/{userId}')
  .onUpdate((change, context) => {
    const user = change.after.data();
    const email = context.params.userId;
    const userRef = db.collection('users').doc(user.email);

    if (!change.after.data() || user.status === 'active') {
      return null;
    }

    // Create subscription in Stripe and PAY!

    return stripe.subscriptions
      .create({
        customer: user.stripeCustomerId,
        source: user.stripeTokenId,
        items: [
          {
            plan: 'HEAL-Monthly'
          }
        ]
      })
      .then(sub => {
        this.userRef
          .update({
            subscriptionId: sub.id,
            subscriptionStart: sub.current_period_start,
            subscriptionEnd: sub.current_period_end,
            stripeCustomerId: user.stripeCustomerId,
            status: 'active',
            active: true,
            terminationDate: null
          })
          .catch(err => console.log('ERROR - CREATING STRIPE payment:', err));
      })
      .catch(err => console.log('ERROR - UPDATING STRIPE relationship:', err));
  });
