import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as shared from '../collections';

const db = admin.firestore();
import * as Stripe from 'stripe';
const stripe = new Stripe(functions.config().stripe.secret);

export const reactiveateSubscription = functions.https.onCall(
  async (data, context) => {
    const userId = data.email || null;
    let tokenId = data.source || null;

    if (!userId) {
      throw new Error('Not valid user');
    }

    const userDoc = await db.doc(`users/${userId}`).get();
    const user = userDoc.data();
    const userRef = db.collection('users').doc(user.email);

    if (!tokenId) {
      tokenId = user.stripeTokenId;
    }

    return stripe.subscriptions
      .create({
        customer: user.stripeCustomerId,
        source: tokenId,
        items: [
          {
            plan: shared.STRIPE_PLAN_ID
          }
        ]
      })
      .then(sub => {
        userRef
          .update({
            registered: new Date(),
            subscriptionId: sub.id,
            subscriptionStart: sub.current_period_start,
            subscriptionEnd: sub.current_period_end,
            stripeCustomerId: user.stripeCustomerId,
            lastPaymentStatus: 'Success',
            status: shared.STATUS_ACTIVE,
            active: true,
            terminationDate: null
          })
          .catch(err => console.log('ERROR - CREATING STRIPE payment:', err));
      })
      .catch(err => console.log('ERROR - UPDATING STRIPE relationship:', err));
  }
);
