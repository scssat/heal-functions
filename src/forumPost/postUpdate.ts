import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as algoliasearch from 'algoliasearch';

// Initialize the Algolia Client
const env = functions.config();
const client = algoliasearch(env.algolia.appid, env.algolia.apikey);
const index = client.initIndex('forumPosts');
import * as shared from '../collections';

export const postUpdate = functions.firestore
  .document(`${shared.MBH_FORUM}/{id}`)
  .onUpdate(async (change, context) => {
    const post = change.after.data();
    const objectID = context.params.id;

    // Add the data to the algolia index
    const updateContent = {
      displayUser: post.displayUser,
      hashTags: post.hashTags,
      title: post.title,
      forumGroup: post.forumGroup,
      content: post.strippedContent
    };

    return index
      .saveObject({
        objectID,
        ...updateContent
      })
      .catch(err => console.error('Error when updating Algolia index', err));
  });
