import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as shared from '../collections';

const db = admin.firestore();
import * as Stripe from 'stripe';
const stripe = new Stripe(functions.config().stripe.secret);

export const userUpdate = functions.firestore.document('users/{userId}').onUpdate((change, context) => {
  const user = change.after.data();
  const uid = context.params.userId;
  const userRef = db.collection('users').doc(uid);

  if (!change.after.data() || user.status === 'active') {
    return null;
  }

  if (user.status === 'pastDue') {
    return null;
  }

  // Create subscription in Stripe and PAY!

  return stripe.subscriptions
    .create({
      customer: user.stripeCustomerId,
      source: user.stripeTokenId,
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
});
