import * as eventcreate from './eventcreate';
import * as pushnotif from './push-notifications';
import * as dmmessage from './dmcreate';
import * as aggregateComment from './forumaggregate';

export const forumAggregate = aggregateComment.aggregateComments;
export const dmSendMessage = dmmessage.dmSendMessage;
export const createEvents = eventcreate.createEvents;
export const pushSupport = pushnotif.sendSupportNotification;
export const pushStory = pushnotif.sendStoryNotification;
export const pushForum = pushnotif.sendForumNotification;
export const pushEmail = pushnotif.sendinternalMessageNotification;
export const pushDMmessage = pushnotif.sendDMmessageNotification;
