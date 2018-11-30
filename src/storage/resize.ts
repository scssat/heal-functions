import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
const db = admin.firestore();
import * as shared from '../collections';

import * as Storage from '@google-cloud/storage';
const gcs = new Storage();
import * as fs from 'fs-extra';

import { tmpdir } from 'os';
import { join, dirname } from 'path';

import * as sharp from 'sharp';

// Sizes: documents wide 550, height 800
// Sizes: images wide 550, height 500
// Sharpe input: wide, height
export const resizeImage = functions.storage.object().onFinalize(async (object, context) => {
  console.log('Starting resizing.....');
  const bucket = gcs.bucket(object.bucket);

  const filePath = object.name;
  const fileName = filePath.split('/').pop();
  const tmpFilePath = join(tmpdir(), fileName);

  if (fileName.includes('resized_')) {
    console.log('Exiting function with OK, to prevent ENDLESS LOOP.....');
    return false;
  }

  let system = false;
  let imageRef = db.collection('dummy');
  let width = 0;
  let height = 0;
  let type = '';

  // Check if this is a SYSTEM avatar or user avatar
  if (filePath.includes('system')) {
    width = 100;
    height = 100;
    system = true;
    type = 'avatar';
    imageRef = db.collection(shared.HEAL_AVATARS);
  } else {
    system = false;
    const uid = filePath.substring(5, filePath.indexOf('/', 5));
    if (filePath.includes(shared.MY_AVATARS)) {
      width = 100;
      height = 100;
      type = 'avatar';
      imageRef = db.collection(`users/${uid}/${shared.MY_AVATARS}`);
    } else if (filePath.includes(shared.MY_IMAGES)) {
      width = 550;
      height = 500;
      type = 'image';
      imageRef = db.collection(`users/${uid}/${shared.MY_IMAGES}`);
    } else if (filePath.includes(shared.MY_DOCUMENTS)) {
      width = 550;
      height = 800;
      type = 'document';
      imageRef = db.collection(`users/${uid}/${shared.MY_DOCUMENTS}`);
    } else {
      console.log('Exiting function - not a valid filpath', filePath);
      return false;
    }
  }

  console.log('Download to tmp ....');
  const resizedImageFileName = 'resized_' + fileName;
  const tmpResizedImagePath = join(tmpdir(), resizedImageFileName);

  await bucket
    .file(filePath)
    .download({
      destination: tmpFilePath
    })
    .catch(err => console.error('Error when downloading to TMP:', err));

  console.log('Resize to tmp....');

  await sharp(tmpFilePath)
    .resize(100, 100)
    .toFile(tmpResizedImagePath)
    .catch(err => console.error('Error from SHARP - reseizing:', err));

  const resizedImageFilePath = join(dirname(filePath), resizedImageFileName);

  console.log('Uplodad finale....');
  await bucket
    .upload(tmpResizedImagePath, {
      destination: resizedImageFilePath
    })
    .catch(err => console.error('Error saving AVATAR', err));

  // Once the image has been uploaded delete the local files to free up disk space.

  console.log('Delete temps and orig file....');
  fs.unlinkSync(tmpFilePath);
  fs.unlinkSync(tmpResizedImagePath);

  // Delete orig file from bucket
  await bucket
    .file(filePath)
    .delete()
    .catch(err => console.error('Error when deleting original file:', err));

  const imageFile = bucket.file(resizedImageFilePath);

  // Get the Signed URLs for the reduced avatar
  const config = {
    action: 'read',
    expires: '01-01-2500'
  };

  const results = await imageFile.getSignedUrl(config);

  console.log('Got Signed URL...');
  const imageResult = results;
  const imageFileURL = imageResult[0];

  let docData = {};

  // Move data to the respective type before add to collection
  switch (type) {
    case 'avatar':
      docData = {
        fileName: resizedImageFileName,
        path: resizedImageFilePath,
        avatarURL: imageFileURL,
        system: system,
        created: new Date()
      };
      break;
    case 'document':
      docData = {
        id: '',
        title: resizedImageFileName,
        path: resizedImageFilePath,
        url: imageFileURL,
        searchstring: resizedImageFileName,
        contactPerson: '',
        description: '',
        documentDate: null,
        created: new Date()
      };
      break;
    case 'image':
      docData = {
        id: '',
        title: resizedImageFileName,
        path: resizedImageFilePath,
        url: imageFileURL,
        created: new Date()
      };
      break;
    default:
      break;
  }

  // Add the URLs to the Database
  console.log('Finally - store to collection...');
  return imageRef.add(docData).catch(err => console.error('Error when saving to data to collection, err'));
});
