import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as shared from '../collections';
const db = admin.firestore();

export const recurringPayment = functions.https.onRequest(async (req, res) => {
  const hook = req.body.type;
  const data = req.body.data.object;
  const stripeCustomerId = data.customer;
  let email = '';

  if (!data) throw new Error('missing data');

  const userRef = db
    .collection(`${shared.USERS}`)
    .where('stripeCustomerId', '==', stripeCustomerId);

  return userRef
    .get()
    .then(querySnapshot => {
      const user = querySnapshot[0].data();
      email = user.email;

      const userUpdate = db.collection(`${shared.USERS}`).doc(email);

      let status = '';
      let active = false;
      let terminationDate = null;
      // Handle successful payment webhook
      if (hook === 'invoice.payment_succeeded') {
        status = 'active';
        active = true;
      }

      // Handle failed payment webhook
      if (hook === 'invoice.payment_failed') {
        status = 'pastDue';
        terminationDate = user.terminationDate;
        active = false;
      }

      userUpdate
        .update({
          status: status,
          active: active,
          terminationDate: terminationDate,
          lastPaymentStatus: hook
        })
        .catch(err => console.log('ERROR - UPDATING payment status:', err));
    })
    .catch(err => {
      console.log(`Error when reading user! - ${err}`);
    })
    .then(() => res.status(200).send(`successfully handled ${hook}`))
    .catch(err => res.status(400).send(`error handling ${hook}`));
});
