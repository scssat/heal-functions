import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
const db = admin.firestore();
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
const stripe = require('stripe')(firebaseConfig.stripe.testkey);

export const startSubscription = functions.https.onCall(
  async (data, context) => {
    const userId = context.auth.token.email || null;

    if (!userId) {
      throw new Error('Not valid user');
    }

    const userDoc = await db.doc(`users/${userId}`).get();
    const user = userDoc.data();

    const subscription = await stripe.subscriptions.retrieve(
      'sub_49ty4767H20z6a'
    );

    const sub = stripe.subscriptions.update('sub_49ty4767H20z6a', {
      cancel_at_period_end: false,
      items: [
        {
          id: subscription.items.data[0].id,
          plan: 'plan_CBb6IXqvTLXp3f'
        }
      ]
    });

    if (!sub) {
      throw new Error('Stripe failed to reactivate subscription');
    }

    // Update user document
    return db.doc(`users/${userId}`).update({
      status: 'activated'
    });
  }
);
