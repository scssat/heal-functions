import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as shared from '../collections';

const db = admin.firestore();
import * as Stripe from 'stripe';
const stripe = new Stripe(functions.config().stripe.secret);

export const reactiveateSubscription = functions.https.onCall(
  async (data, context) => {
    const userId = data.email || null;

    if (!userId) {
      throw new Error('Not valid user');
    }

    const userDoc = await db.doc(`users/${userId}`).get();
    const user = userDoc.data();

    const subscription = await stripe.subscriptions.retrieve(
      user.subscriptionId
    );

    const sub = stripe.subscriptions.update(user.subscriptionId, {
      cancel_at_period_end: false,
      items: [
        {
          id: subscription.items.data[0].id,
          plan: shared.STRIPE_PLAN_ID
        }
      ]
    });

    if (!sub) {
      throw new Error('Stripe failed to reactivate subscription');
    }

    // Update user document
    return db.doc(`users/${userId}`).update({
      status: 'activated',
      active: true,
      terminationDate: null
    });
  }
);
