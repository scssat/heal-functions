import * as eventcreate from './eventcreate';
import * as pushnotif from './push-notifications';

export const createEvents = eventcreate.createEvents;
export const pushSupport = pushnotif.supportNotification;
export const pushStory = pushnotif.storyNotification;
export const pushForum = pushnotif.forumNotification;
