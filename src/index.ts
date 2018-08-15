import * as eventcreate from './eventcreate'; // Includes initializeApp()
import * as pushnotif from './push-notifications';
export { dmSendMessage } from './dmcreate';
export { aggregateComments } from './forumaggregate';
export { aggregateStoryComments } from './storyaggregate';
export { storyHeartDelete, storyHeartCreate } from './storyheart';
export { postHeartDelete, postHeartCreate } from './postheart';
export { storyFollowerCreate, storyFollowerDelete } from './storyFollower';

//export const forumAggregate = aggregateComment.aggregateComments;
//export const storyAggregate = aggregateStoryComments.aggregateStoryComments;
//export const dmSendMessage = dmmessage.dmSendMessage;

export const createEvents = eventcreate.createEvents;
export const pushSupport = pushnotif.sendSupportNotification;
export const pushStory = pushnotif.sendStoryNotification;
export const pushForum = pushnotif.sendForumNotification;
export const pushEmail = pushnotif.sendinternalMessageNotification;
export const pushDMmessage = pushnotif.sendDMmessageNotification;
