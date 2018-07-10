import { sendSupportNotification } from './supportposts';
import { sendStoryNotification } from './mystoriescomments';
import { sendForumNotification } from './myforumcomments';

export const supportNotification = sendSupportNotification;
export const storyNotification = sendStoryNotification;
export const forumNotification = sendForumNotification;
