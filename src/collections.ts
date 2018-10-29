export const USERS = 'users';
export const USER_TYPES = 'userTypes';
export const USER_TYPE_FAMILY = 'family';
export const USER_LINKS = 'userLinks';
export const FORUM_GROUPS = 'forumGroups'; // Not in use
export const CANCER_TYPES = 'cancerTypes';
export const MEDICATION_LIBRARY = 'medicationLibrary';
export const NUTRIANT_LIBRARY = 'nutriantLibrary';
export const NUTRIANT_SUPPLEMENT = 'nutriantSupplementLibrary';
export const NUTRIANT_SUPPLEMENT_TYPE = 'nutriantSupplementType';
export const NUTRIANT_TYPE = 'nutriantType';
export const LINK_LIBRARY = 'linkLibrary';
export const MEASUREMENT_LIBRARY = 'measurementLibrary';
export const VIDEO_LINK_LIBRARY = 'videoLinkLibrary';
export const DIARY_TYPE_LIBRARY = 'diaryTypes';
export const SEND_MESSAGE = 'sendmessage';
export const RESPONSE_MESSAGE = 'responsemessage';
export const RECIPE = 'recipe';
export const RECIPE_CATEGORY = 'recipeCategory';
export const INGRIDENT = 'ingredient';
export const PATIENT_ORGANIZATION = 'patientOrganizations';
export const PAYMENTS = 'payments';
export const CUSTOMERS = 'customers';
export const SUBSCRIPTION_PLANS = 'subscriptionPlans';
export const STATUS_PAST_DUE = 'pastDue';
export const STATUS_ACTIVE = 'active';

export const HASH_TAG_LIBRARY = 'hashTagLibrary';

//Stripe
export const STRIPE_PLAN_ID = 'plan_DsJ6iJphx8orgO';

// NIU
export const TASKS = 'tasks';

// DM collections
export const DM_USERS = 'dmusers';
export const DM_MESSAGES = 'dmmessages';

export const ENVENT_TYPE_MANUAL = 'Manual';
export const ENVENT_TYPE_MEDICATION = 'Medication';
export const ENVENT_TYPE_TRANSPORTATION = 'Transportation';
export const ENVENT_TYPE_TREATMENT = 'Treatment';
export const ENVENT_TYPE_TREATMENT_MED = 'TreatmentMedication';
export const ENVENT_TYPE_MEASUREMENT = 'Measurement';

export const MY_TREATMENT = 'myTreatment';
export const MY_TREATMENT_HISTORY = 'myMedicalHistory';
export const CONTACTS = 'contacts';
export const MY_EVENTS = 'myEvents';
export const MY_NOTIFICATION = 'notifications';

export const MY_NUTRIANT_LIBRARY = 'myNutriantLibrary';
export const MY_NUTRIDRINK_LIBRARY = 'myNutriantNutriDrink';
export const MY_RECIPE = 'myRecipe';
export const MY_INGRIDENT = 'myIngredient';
export const MY_DAILY_CONSUMPTION = 'myDailyConsumption';
export const MY_MAIN_DAILY_CONSUMPTION = 'myMainDailyConsumption';

export const MY_MEASUREMENT = 'measurements';
export const MY_MEASURE = 'measures';
export const MY_FAMILY = 'familyposts';

// Story collections
export const MY_STORIES = 'mystories';
export const STORY_HEARTS = 'storyHeart';
export const MY_COMMENTS = 'comments';
export const FOLLOWER_STORY = 'storyFollower';

//Forum collections
export const MBH_FORUM = 'forumposts';
export const MBH_FORUM_HEARTS = 'forumHeart';
export const MBH_FORUM_COMMENTS = 'forumcomments';
export const MBH_FOLLOWER_FORUM = 'forumRelationships';
export const MBH_FORUM_HASHTAG = 'forumHashtag';

export const HEALTH_PROFILE = 'healthProfile';

// Chat
export const CHAT_ROOM_LIST = 'chatrooms';
export const CHAT_USER = 'chatuser';
export const CHAT_MESSAGE = 'message';

//My Medication
export const MY_MEDICATION_LIBRARY = 'myMedicationLibrary';
export const MY_MEDICATION_CABINET = 'myMedicationCabinet';
export const MY_MEDICATION_HISTORY = 'myMedicationHistory';
export const MY_MEDICATION_INTAKE = 'myMedicationIntake';
export const MY_MEDICATION_COMPLIANCE = 'myMedicationCompliance';

export const MY_VIDEO_LINKS = 'videoLinks';
export const MY_LINKS = 'mylinks';
export const MY_DIARY = 'diaries';
export const MY_IMAGES = 'images';
export const MY_DOCUMENTS = 'documents';
export const MY_INCOMMING_MESSAGES = 'mymessages';
export const MY_DIAGNOSE = 'diagnose';
export const MY_AVATARS = 'myAvatars';

// System storage paths
export const PROFILE_PICTS = 'profilepicts';

// User storage paths
export const PROFILE_PATH = 'profilepicts';
export const IMAGES_PATH = 'myimages';
export const DOCUMENTS_PATH = 'mydocuments';

export const USERTYPE_DEFAULT = 'Regulær';
export const USERTYPE_REGULAR = 'Regulær';
export const USERTYPE_ADMIN = 'Admin';
export const USERTYPE_CANCER_COORDINATOR = 'Kreft koordinator';
export const USERTYPE_MODERATOR = 'Moderator';
export const USERTYPE_EXPERT = 'Forum Ekspert';
export const USERTYPE_FAMILY = 'Family';
export const USERTYPE_CANCER_NURSE = 'Kreftsykepleier';

export const MY_IMAGE_DIRECTORY = 'assets/photos/';
export const MY_DOCUMENT_DIRECTORY = 'assets/documents/';
export const MY_PROFILE_IMAGE_DIRECTORY = 'assets/images/';

export const TOASTR_SUCCESS = 'success';
export const TOASTR_INFO = 'info';
export const TOASTR_ERROR = 'error';
export const TOASTR_WARNING = 'warning';
export const TOASTR_INFO_CLICK = 'infoClick';

export const weekDays = [
  'Søndag',
  'Mandag',
  'Tirsdag',
  'Onsdag',
  'Torsdag',
  'Fredag',
  'Lørdag'
];

export const enum NotificationTypes {
  FamilyPost = 'Support',
  MyStoryComment = 'MyStoryComment',
  DirectMessage = 'DirectMessage',
  Forum = 'Forum',
  InternalEmail = 'InternalEmail',
  Calendar = 'Calendar',
  CalendarReminder = 'CalendarReminder',
  NewPostGroup = 'NewPostGroup',
  StoryFollower = 'storyFollower',
  ForumComment = 'ForumComment'
}

export const enum NotificationTypesNo {
  FamilyPost = 'Støttepost',
  MyStoryComment = 'Kommentar til historie',
  DirectMessage = 'Melding fra bruker',
  Forum = 'Forum',
  InternalEmail = 'Intern email',
  Calendar = 'Kalender',
  StoryFollower = 'Følger Min Historie'
}
