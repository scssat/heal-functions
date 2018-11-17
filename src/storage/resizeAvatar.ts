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

// NOTE: Documents and Images are NOT resized!
export const resizeAvatar = functions.storage
  .object()
  .onFinalize(async (object, context) => {
    const bucket = gcs.bucket(object.bucket);

    const uid = context.auth.uid;
    const filePath = object.name;
    const fileName = filePath.split('/').pop();
    const tmpFilePath = join(tmpdir(), object.name);

    let system = true;
    let avatarRef = db.collection('HEALavatars' );

    // Check if this is a SYSTEM avatar or user avatar
    if (!filePath.indexOf('system')) {
       system = false;
        const avatarRef = db.collection(
          `users/${uid}/${shared.MY_AVATARS}`
        );
    }

    const avatarFileName = 'avatar_' + fileName;
    const tmpAvatarPath = join(tmpdir(), avatarFileName);

    if (fileName.includes('avatar_')) {
      console.log('exiting function');
      return false;
    }

    if (!filePath.includes(shared.MY_AVATARS)) {
      console.log('exiting function - no AVATAR');
      return false;
    }

    await bucket.file(filePath).download({
      destination: tmpFilePath
    });

    await sharp(tmpFilePath)
      .resize(100, 100)
      .toFile(tmpAvatarPath);

    const avatarFilepath =  join(dirname(filePath), avatarFileName);

    await bucket.upload(tmpAvatarPath, {
      destination: avatarFilepath
    }).catch(err => console.error('Error saving AVATAR', err));

      // Once the image has been uploaded delete the local files to free up disk space.
  fs.unlinkSync(tmpFilePath);
  fs.unlinkSync(filePath);

  const avatarFile = bucket.file(avatarFilepath);

  // Get the Signed URLs for the thumbnail and original image.
  const config = {
    action: 'read',
    expires: '03-01-2500',
  };

  const results = await  avatarFile.getSignedUrl(config);

  console.log('Got Signed URLs.');
  const avatarResult = results;
  const avatarFileURL = avatarResult[0];

  // Add the URLs to the Database
    return avatarRef.add({avatarURL : avatarFileURL, system : system})
  });
