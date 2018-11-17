import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as shared from '../collections';
import * as Storage from '@google-cloud/storage';
const gcs = new Storage();

admin.initializeApp();
const db = admin.firestore();
import * as Stripe from 'stripe';
const stripe = new Stripe(functions.config().stripe.secret);


export const  userCreate =  functions.firestore
  .document('users/{uid}')
  .onCreate (async (snap, context) => {
    //const uid = context.params.uid;
    const user = snap.data();

    const userRef = db.collection('users').doc(user.uid);

    console.log('INIT new user start');

    // Create storage buckets. Disabled until further investigated!
    // user.avatarBucket = uuidv4() + '_' + shared.MY_AVATARS + '_' + new Date().getSeconds().toString;
    // user.imageBucket = uuidv4() + '_' + shared.MY_IMAGES + '_' + new Date().getSeconds().toString;
    // user.documentBucket = uuidv4() + '_' + shared.MY_DOCUMENTS  + '_' + new Date().getSeconds().toString;

    // createBucket(user.avatarBucket);
    // createBucket(user.imageBucket);
    // createBucket(user.documentBucket);

    await copyAll(user.uid).catch(err =>
      console.error('Error copying user data!', err)
    );

    // Create subscription in Stripe and PAY!
    return stripe.customers
      .create({
        email: user.email
      })
      .then(customer => {
        /// update database with stripe customer id
        user.stripeCustomerId = customer.id;
        userRef
          .update(user)
          .catch(err => console.error('Error updating user data!', err));
      });
  });

  // If used...replace with uuid-4 import
  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
    async function createBucket(bucketName) {
    // Creates a new bucket, each user have 3 buckets, AVATARS, IMAGES and DOCUMENTS
    // Location is Finland
    await gcs.createBucket(bucketName, {
      location: 'europe-north1',
      storageClass: 'MULTI_REGIONAL',
    }).catch(err => console.error(`Error crating storage bucket ${bucketName} created.  - Error: ${err}`));

    console.log(`Bucket ${bucketName} created.`);
    // [END storage_create_bucket]
  }

async function copyAll(uid: string) {
  await createMeasurements(uid);
  await createRecipes(uid);
}


function createMeasurements(uid: string): Promise<any> {
  // Copy MEASUREMENTS from library
  const measurementLibrary = db
    .collection(shared.MEASUREMENT_LIBRARY)
    .orderBy('medicationName', 'asc');
  const userMeasurementLibrary = db.collection(
    `users/${uid}/${shared.MY_MEDICATION_LIBRARY}`
  );

  return measurementLibrary
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        const measurementLibraryCopy = doc.data();
        const myMeasurement = {
          id: '',
          name: measurementLibraryCopy.name,
          allowDelete: measurementLibraryCopy.allowDelete,
          custom: false,
          units: measurementLibraryCopy.units,
          cancerTypes: '',
          keySearch: measurementLibraryCopy.keySearch,
          gender: measurementLibraryCopy.gender,
          measurementURL: measurementLibraryCopy.measurementURL,
          graphURL: measurementLibraryCopy.graphURL,
          description: '',
          reminder: 0,
          copyToCalendar: false,
          lastCalendarUpdate: null,
          general: measurementLibraryCopy.general,
          selected: false,
          firstMeasurement: null,
          numberOfMeasures: 0
        };
        userMeasurementLibrary.add(myMeasurement);
      });
    })
    .catch(err =>
      console.error('Error creating user measurement library', err)
    );
}

function createRecipes(uid: string): Promise<any> {
  // Copy recipe library
  const recipeLibrary = db
    .collection(shared.RECIPE)
    .orderBy('name', 'asc');
  const userRecipeLibrary = db.collection(
    `users/${uid}/${shared.MY_RECIPE}`
  );

  return recipeLibrary
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        const recipe = doc.data();
        const recipeId = doc.id;
        const myRecipe = {
          name: recipe.name,
          category: recipe.category,
          description:
            recipe.description === undefined ? '' : recipe.description,
          deleteAllowed: recipe.deleteAllowed,
          portionOf: recipe.portionOf,
          KCALPerPotion:
            recipe.KCALPerPotion === undefined ? 0 : recipe.KCALPerPotion,
          proteinPerPotion:
            recipe.proteinPerPotion === undefined ? 0 : recipe.proteinPerPotion,
          fiberPerPotion:
            recipe.fiberPerPotion === undefined ? 0 : recipe.fiberPerPotion,
          fatPerPotion:
            recipe.fatPerPotion === undefined ? 0 : recipe.fatPerPotion,
          karbPerPotion:
            recipe.karbPerPotion === undefined ? 0 : recipe.karbPerPotion,
          picturePath:
            recipe.picturePath === undefined ? '' : recipe.picturePath,
          timeToPrepare: recipe.timeToPrepare,
          difficulty: recipe.difficulty === undefined ? 0 : recipe.difficulty,
          numberOfIngredients:
            recipe.numberOfIngredients === undefined
              ? 0
              : recipe.numberOfIngredients
        };

        userRecipeLibrary
          .add(myRecipe)
          .then(ref => {
            const myRecipeId = ref.id;
            createIngredient(myRecipeId, recipeId).catch(err =>
              console.error('Error when creating ingridient (Add)', err)
            );
          })
          .catch(err => console.error('Error creating user recipe (Add)', err));
      });
    })
    .catch(err => console.error('Error creating user recipe library', err));
}

function createIngredient(newId, mainId: string): Promise<any> {
  const ingredientLibraryCollection = db
    .collection(shared.RECIPE)
    .doc(mainId)
    .collection(shared.INGRIDENT);

  return ingredientLibraryCollection
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        const ingredient = doc.data();
        const myIngredient = {
          id: '',
          type: ingredient.type,
          mainId: newId,
          name: ingredient.name,
          amount: ingredient.amount,
          manufactor:
            ingredient.manufactor === undefined ? '' : ingredient.manufactor,
          manufactorURL:
            ingredient.manufactorURL === undefined
              ? ''
              : ingredient.manufactorURL,
          KCAL: ingredient.KCAL,
          protein: ingredient.protein,
          fiber: ingredient.fiber,
          fat: ingredient.fat,
          dosagePerDay: ingredient.dosagePerDay,
          content: ingredient.content,
          karb: ingredient.karb === undefined ? 0 : ingredient.karb,
          salt: ingredient.salt === undefined ? 0 : ingredient.salt,
          contentURL:
            ingredient.contentURL === undefined ? '' : ingredient.contentURL
        };

        ingredientLibraryCollection.add(myIngredient);
      });
    })
    .catch(err =>
      console.error('Error creating user recipe ingredient library', err)
    );
}
