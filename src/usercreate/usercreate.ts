import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as mbhCollection from '../collections';

admin.initializeApp();
const db = admin.firestore();
import * as Stripe from 'stripe';
const stripe = new Stripe(functions.config().stripe.secret);

export const userCreate = functions.firestore
  .document('users/{userId}')
  .onCreate((snap, context) => {
    //const email = context.params.userId;
    const user = snap.data();

    const userRef = db.collection('users').doc(user.email);

    console.log('INIT new user start');

    copyAll(user.email).catch(err =>
      console.log('Error copying user data!', err)
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
          .catch(err => console.log('Error updating user data!', err));
      });
  });

async function copyAll(email: string) {
  await createVideolinks(email);
  await createLinks(email);
  await createMedication(email);
  await createMeasurements(email);
  await createNutriant(email);
  await createNutridrink(email);
  await createRecipes(email);
}

function setEmptyVideoLink() {
  const emptyVideoLink = {
    id: '',
    name: '',
    category: '',
    cancerTypes: '',
    lastVisit: null,
    link: '',
    title: '',
    description: '',
    thumbnailUrl: ''
  };
  return emptyVideoLink;
}

function setEmptyLink() {
  const emptyLink = {
    id: '',
    lastVisit: null,
    name: '',
    category: '',
    link: '',
    cancerTypes: '',
    description: ''
  };
  return emptyLink;
}

function createVideolinks(email: string): Promise<any> {
  // Video links
  const videoLibrary = db
    .collection(mbhCollection.VIDEO_LINK_LIBRARY)
    .orderBy('name', 'asc');
  const userVideoLibrary = db.collection(
    `users/${email}/${mbhCollection.MY_VIDEO_LINKS}`
  );

  return videoLibrary
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        const newLink = setEmptyVideoLink();
        const link = doc.data();
        newLink.id = '';
        newLink.name = link.name;
        newLink.category = link.category ? link.category : '';
        newLink.cancerTypes = link.cancerTypes ? link.cancerTypes : '';
        newLink.lastVisit = null;
        newLink.link = link.link;
        newLink.title = link.title ? link.title : '';
        newLink.description = link.description ? link.description : '';
        newLink.thumbnailUrl = link.thumbnailUrl ? link.thumbnailUrl : '';
        userVideoLibrary.add(newLink);
      });
    })
    .catch(err => console.log('Error creating user video links', err));
}

function createLinks(email: string): Promise<any> {
  //General links
  const linkLibrary = db
    .collection(mbhCollection.LINK_LIBRARY)
    .orderBy('name', 'asc');
  const userLinkLibrary = db.collection(
    `users/${email}/${mbhCollection.MY_LINKS}`
  );

  return linkLibrary
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        const newLink = setEmptyLink();
        const link = doc.data();
        newLink.id = '';
        newLink.name = link.name;
        newLink.category = link.category ? link.category : '';
        newLink.cancerTypes = link.cancerTypes ? link.cancerTypes : '';
        newLink.lastVisit = null;
        newLink.link = link.link;
        newLink.description = link.description ? link.description : '';
        userLinkLibrary.add(newLink);
      });
    })
    .catch(err => console.log('Error creating user general links', err));
}

function createMedication(email: string): Promise<any> {
  // Copy MEDICATION from library
  const medcationLibrary = db
    .collection(mbhCollection.MEDICATION_LIBRARY)
    .orderBy('medicationName', 'asc');
  const userMedcationLibrary = db.collection(
    `users/${email}/${mbhCollection.MY_MEDICATION_LIBRARY}`
  );

  return medcationLibrary
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        const medicationLibrary = doc.data();
        const myMedicationLibrary = {
          id: '',
          medicationLibId: medicationLibrary.id,
          custom: false,
          deleteAllowed: true,
          medicationName: medicationLibrary.medicationName,
          medicationURL: medicationLibrary.medicationURL,
          leafletURL: medicationLibrary.leafletURL,
          pictureURL: medicationLibrary.pictureURL,
          interactionURL: medicationLibrary.interactionURL
        };
        userMedcationLibrary.add(myMedicationLibrary);
      });
    })
    .catch(err => console.log('Error creating user medication library', err));
}

function createMeasurements(email: string): Promise<any> {
  // Copy MEASUREMENTS from library
  const measurementLibrary = db
    .collection(mbhCollection.MEASUREMENT_LIBRARY)
    .orderBy('medicationName', 'asc');
  const userMeasurementLibrary = db.collection(
    `users/${email}/${mbhCollection.MY_MEDICATION_LIBRARY}`
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
    .catch(err => console.log('Error creating user measurement library', err));
}

function createNutriant(email: string): Promise<any> {
  // Copy nutrition library
  const nutriantLibrary = db
    .collection(mbhCollection.NUTRIANT_LIBRARY)
    .orderBy('name', 'asc');
  const userNutriantLibrary = db.collection(
    `users/${email}/${mbhCollection.MY_NUTRIANT_LIBRARY}`
  );

  return nutriantLibrary
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        const nutritionLibrary = doc.data();
        const myNutritionLibrary = {
          id: '',
          type: nutritionLibrary.type,
          name: nutritionLibrary.name,
          KCAL: nutritionLibrary.KCAL,
          protein: nutritionLibrary.protein,
          fiber: nutritionLibrary.fiber,
          favorite: false,
          fat: nutritionLibrary.fat,
          dosagePerDay: nutritionLibrary.dosagePerDay,
          content: nutritionLibrary.content,
          manufactor:
            nutritionLibrary.manufactor === undefined
              ? ''
              : nutritionLibrary.manufactor,
          manufactorURL:
            nutritionLibrary.manufactorURL === undefined
              ? ''
              : nutritionLibrary.manufactorURL,
          contentURL:
            nutritionLibrary.contentURL === undefined
              ? ''
              : nutritionLibrary.contentURL,
          karb: nutritionLibrary.karb === undefined ? 0 : nutritionLibrary.karb,
          salt: nutritionLibrary.salt === undefined ? 0 : nutritionLibrary.salt
        };

        userNutriantLibrary.add(myNutritionLibrary);
      });
    })
    .catch(err => console.log('Error creating user nutriant library', err));
}

function createNutridrink(email: string): Promise<any> {
  // Copy nutridrink library
  const nutridrinkLibrary = db
    .collection(mbhCollection.NUTRIANT_SUPPLEMENT)
    .orderBy('name', 'asc');
  const userNutridrinkLibrary = db.collection(
    `users/${email}/${mbhCollection.MY_NUTRIDRINK_LIBRARY}`
  );

  return nutridrinkLibrary
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        const nutridrink = doc.data();
        const myNutridrink = {
          id: '',
          type: nutridrink.type,
          name: nutridrink.name,
          KCAL: nutridrink.KCAL,
          protein: nutridrink.protein,
          fiber: nutridrink.fiber,
          favorite: false,
          fat: nutridrink.fat,
          dosagePerDay: nutridrink.dosagePerDay,
          nutritionUnit: nutridrink.nutritionUnit,
          contentPerUnit: nutridrink.contentPerUnit,
          manufactor:
            nutridrink.manufactor === undefined ? '' : nutridrink.manufactor,
          manufactorURL:
            nutridrink.manufactorURL === undefined
              ? ''
              : nutridrink.manufactorURL,
          contentURL:
            nutridrink.contentURL === undefined ? '' : nutridrink.contentURL,
          karb: nutridrink.karb === undefined ? 0 : nutridrink.karb,
          salt: nutridrink.salt === undefined ? 0 : nutridrink.salt
        };
        userNutridrinkLibrary.add(myNutridrink);
      });
    })
    .catch(err => console.log('Error creating user nutriant library', err));
}

function createRecipes(email: string): Promise<any> {
  // Copy recipe library
  const recipeLibrary = db
    .collection(mbhCollection.RECIPE)
    .orderBy('name', 'asc');
  const userRecipeLibrary = db.collection(
    `users/${email}/${mbhCollection.MY_RECIPE}`
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
              console.log('Error when creating ingridient (Add)', err)
            );
          })
          .catch(err => console.log('Error creating user recipe (Add)', err));
      });
    })
    .catch(err => console.log('Error creating user recipe library', err));
}

function createIngredient(newId, mainId: string): Promise<any> {
  const ingredientLibraryCollection = db
    .collection(mbhCollection.RECIPE)
    .doc(mainId)
    .collection(mbhCollection.INGRIDENT);

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
      console.log('Error creating user recipe ingredient library', err)
    );
}
