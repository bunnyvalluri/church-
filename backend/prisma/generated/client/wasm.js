
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  emailVerified: 'emailVerified',
  image: 'image',
  profilePublicId: 'profilePublicId',
  password: 'password',
  role: 'role',
  phone: 'phone',
  address: 'address',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  sessionTokenHash: 'sessionTokenHash',
  role: 'role',
  createdAt: 'createdAt',
  expiresAt: 'expiresAt',
  lastActivityAt: 'lastActivityAt',
  ipHash: 'ipHash',
  userAgentHash: 'userAgentHash',
  revokedAt: 'revokedAt'
};

exports.Prisma.EventScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  shortDescription: 'shortDescription',
  description: 'description',
  date: 'date',
  endDate: 'endDate',
  time: 'time',
  endTime: 'endTime',
  timezone: 'timezone',
  location: 'location',
  googleMapsUrl: 'googleMapsUrl',
  category: 'category',
  organizer: 'organizer',
  speaker: 'speaker',
  pastor: 'pastor',
  contactPerson: 'contactPerson',
  contactPhone: 'contactPhone',
  contactEmail: 'contactEmail',
  registrationRequired: 'registrationRequired',
  registrationLimit: 'registrationLimit',
  remainingSeats: 'remainingSeats',
  image: 'image',
  coverImagePublicId: 'coverImagePublicId',
  eventBanner: 'eventBanner',
  eventBannerPublicId: 'eventBannerPublicId',
  tags: 'tags',
  featured: 'featured',
  priority: 'priority',
  colorTheme: 'colorTheme',
  status: 'status',
  visibility: 'visibility',
  registrationOpenDate: 'registrationOpenDate',
  registrationCloseDate: 'registrationCloseDate',
  seoTitle: 'seoTitle',
  seoDescription: 'seoDescription',
  isDeleted: 'isDeleted',
  deletedAt: 'deletedAt',
  displayOrder: 'displayOrder',
  isPublished: 'isPublished',
  branchId: 'branchId',
  createdById: 'createdById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  videoUrl: 'videoUrl'
};

exports.Prisma.EventMediaScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  imageUrl: 'imageUrl',
  publicId: 'publicId',
  caption: 'caption',
  uploadedById: 'uploadedById',
  uploadedAt: 'uploadedAt'
};

exports.Prisma.EventImageScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  url: 'url',
  publicId: 'publicId',
  caption: 'caption',
  uploadedAt: 'uploadedAt'
};

exports.Prisma.EventVideoScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  url: 'url',
  publicId: 'publicId',
  caption: 'caption',
  uploadedAt: 'uploadedAt'
};

exports.Prisma.EventRegistrationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  eventId: 'eventId',
  name: 'name',
  email: 'email',
  phone: 'phone',
  qrCode: 'qrCode',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SermonScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  subtitle: 'subtitle',
  shortDescription: 'shortDescription',
  description: 'description',
  bibleVerse: 'bibleVerse',
  book: 'book',
  chapter: 'chapter',
  verses: 'verses',
  speaker: 'speaker',
  pastor: 'pastor',
  guestSpeaker: 'guestSpeaker',
  branch: 'branch',
  category: 'category',
  language: 'language',
  date: 'date',
  views: 'views',
  duration: 'duration',
  tags: 'tags',
  keywords: 'keywords',
  thumbnail: 'thumbnail',
  thumbnailPublicId: 'thumbnailPublicId',
  banner: 'banner',
  bannerPublicId: 'bannerPublicId',
  videoUrl: 'videoUrl',
  videoPublicId: 'videoPublicId',
  audioUrl: 'audioUrl',
  audioPublicId: 'audioPublicId',
  pdfUrl: 'pdfUrl',
  pdfPublicId: 'pdfPublicId',
  presentationUrl: 'presentationUrl',
  presentationPublicId: 'presentationPublicId',
  transcript: 'transcript',
  featured: 'featured',
  recommended: 'recommended',
  visibility: 'visibility',
  status: 'status',
  seoTitle: 'seoTitle',
  seoDescription: 'seoDescription',
  displayOrder: 'displayOrder',
  isDeleted: 'isDeleted',
  deletedAt: 'deletedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  createdById: 'createdById'
};

exports.Prisma.SermonMediaScalarFieldEnum = {
  id: 'id',
  sermonId: 'sermonId',
  type: 'type',
  url: 'url',
  publicId: 'publicId',
  createdAt: 'createdAt'
};

exports.Prisma.SermonAudioScalarFieldEnum = {
  id: 'id',
  sermonId: 'sermonId',
  url: 'url',
  publicId: 'publicId',
  createdAt: 'createdAt'
};

exports.Prisma.SermonNotesScalarFieldEnum = {
  id: 'id',
  sermonId: 'sermonId',
  url: 'url',
  publicId: 'publicId',
  createdAt: 'createdAt'
};

exports.Prisma.SermonViewScalarFieldEnum = {
  id: 'id',
  sermonId: 'sermonId',
  userId: 'userId',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  watchTime: 'watchTime',
  completionRate: 'completionRate',
  createdAt: 'createdAt'
};

exports.Prisma.SermonLikeScalarFieldEnum = {
  id: 'id',
  sermonId: 'sermonId',
  userId: 'userId',
  createdAt: 'createdAt'
};

exports.Prisma.SermonCommentScalarFieldEnum = {
  id: 'id',
  sermonId: 'sermonId',
  userId: 'userId',
  content: 'content',
  isDeleted: 'isDeleted',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SermonDownloadScalarFieldEnum = {
  id: 'id',
  sermonId: 'sermonId',
  userId: 'userId',
  fileType: 'fileType',
  ipAddress: 'ipAddress',
  createdAt: 'createdAt'
};

exports.Prisma.SermonBookmarkScalarFieldEnum = {
  id: 'id',
  sermonId: 'sermonId',
  userId: 'userId',
  createdAt: 'createdAt'
};

exports.Prisma.PrayerRequestScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  description: 'description',
  category: 'category',
  urgencyLevel: 'urgencyLevel',
  aiSummary: 'aiSummary',
  isAnonymous: 'isAnonymous',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DonationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  amount: 'amount',
  currency: 'currency',
  purpose: 'purpose',
  purposeId: 'purposeId',
  branchId: 'branchId',
  sessionId: 'sessionId',
  campaignId: 'campaignId',
  campaignName: 'campaignName',
  paymentMethod: 'paymentMethod',
  upiApp: 'upiApp',
  stripeId: 'stripeId',
  razorpayOrderId: 'razorpayOrderId',
  razorpayPaymentId: 'razorpayPaymentId',
  razorpaySignature: 'razorpaySignature',
  donorName: 'donorName',
  donorEmail: 'donorEmail',
  donorPhone: 'donorPhone',
  panNumber: 'panNumber',
  prayerRequest: 'prayerRequest',
  notes: 'notes',
  isAnonymous: 'isAnonymous',
  status: 'status',
  amountVerified: 'amountVerified',
  signatureVerified: 'signatureVerified',
  verifiedBy: 'verifiedBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AnnouncementScalarFieldEnum = {
  id: 'id',
  title: 'title',
  content: 'content',
  priority: 'priority',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TestimonialScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  content: 'content',
  isPublic: 'isPublic',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MinistryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  leader: 'leader',
  image: 'image',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PastorScalarFieldEnum = {
  id: 'id',
  name: 'name',
  title: 'title',
  designation: 'designation',
  bio: 'bio',
  image: 'image',
  imagePublicId: 'imagePublicId',
  email: 'email',
  phone: 'phone',
  socialLinks: 'socialLinks',
  branchId: 'branchId',
  isActive: 'isActive',
  isDeleted: 'isDeleted',
  displayOrder: 'displayOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GalleryScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  imageUrl: 'imageUrl',
  thumbnailUrl: 'thumbnailUrl',
  category: 'category',
  branchId: 'branchId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ContactMessageScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  phone: 'phone',
  subject: 'subject',
  message: 'message',
  isRead: 'isRead',
  createdAt: 'createdAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  type: 'type',
  title: 'title',
  content: 'content',
  isRead: 'isRead',
  link: 'link',
  createdAt: 'createdAt'
};

exports.Prisma.ChurchSettingsScalarFieldEnum = {
  id: 'id',
  churchName: 'churchName',
  tagline: 'tagline',
  primaryEmail: 'primaryEmail',
  contactPhone: 'contactPhone',
  address: 'address',
  worshipServices: 'worshipServices',
  bilingualSupport: 'bilingualSupport',
  visitorRegistrationEnabled: 'visitorRegistrationEnabled',
  minDonationAmount: 'minDonationAmount',
  maxDonationAmount: 'maxDonationAmount',
  upiId: 'upiId',
  merchantName: 'merchantName',
  qrExpiryMinutes: 'qrExpiryMinutes',
  eightygRegistrationNo: 'eightygRegistrationNo',
  eightygValidFrom: 'eightygValidFrom',
  eightygValidUntil: 'eightygValidUntil',
  adminAlertEmails: 'adminAlertEmails',
  financeAlertEmails: 'financeAlertEmails',
  updatedAt: 'updatedAt'
};

exports.Prisma.MemberRequestScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  phone: 'phone',
  type: 'type',
  time: 'time',
  status: 'status',
  avatar: 'avatar',
  createdAt: 'createdAt'
};

exports.Prisma.SmallGroupScalarFieldEnum = {
  id: 'id',
  name: 'name',
  leader: 'leader',
  location: 'location',
  meetingTime: 'meetingTime',
  attendanceAvg: 'attendanceAvg',
  createdAt: 'createdAt'
};

exports.Prisma.VolunteerScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  phone: 'phone',
  ministry: 'ministry',
  status: 'status',
  appliedAt: 'appliedAt',
  createdAt: 'createdAt'
};

exports.Prisma.BibleStudyScalarFieldEnum = {
  id: 'id',
  name: 'name',
  leader: 'leader',
  time: 'time',
  membersCount: 'membersCount',
  day: 'day',
  createdAt: 'createdAt'
};

exports.Prisma.AttendanceRecordScalarFieldEnum = {
  id: 'id',
  date: 'date',
  serviceType: 'serviceType',
  location: 'location',
  headcount: 'headcount',
  newVisitors: 'newVisitors',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PledgeScalarFieldEnum = {
  id: 'id',
  donorName: 'donorName',
  donorEmail: 'donorEmail',
  committedAmount: 'committedAmount',
  paidAmount: 'paidAmount',
  targetDate: 'targetDate',
  purpose: 'purpose',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TransactionScalarFieldEnum = {
  id: 'id',
  type: 'type',
  amount: 'amount',
  category: 'category',
  description: 'description',
  date: 'date',
  account: 'account',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  name: 'name',
  balance: 'balance',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NgoProjectScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  details: 'details',
  imageUrl: 'imageUrl',
  targetAmount: 'targetAmount',
  raisedAmount: 'raisedAmount',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NgoMediaScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  type: 'type',
  url: 'url',
  publicId: 'publicId',
  thumbnailUrl: 'thumbnailUrl',
  projectId: 'projectId',
  category: 'category',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NgoVolunteerScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  phone: 'phone',
  skills: 'skills',
  status: 'status',
  projectId: 'projectId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BranchScalarFieldEnum = {
  id: 'id',
  name: 'name',
  address: 'address',
  mapsUrl: 'mapsUrl',
  serviceHours: 'serviceHours',
  phone: 'phone',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.EventReportScalarFieldEnum = {
  id: 'id',
  branchId: 'branchId',
  eventId: 'eventId',
  title: 'title',
  description: 'description',
  attendanceCount: 'attendanceCount',
  offeringAmount: 'offeringAmount',
  visitorsCount: 'visitorsCount',
  newMembersCount: 'newMembersCount',
  prayerRequestsCount: 'prayerRequestsCount',
  expenses: 'expenses',
  comments: 'comments',
  summary: 'summary',
  photos: 'photos',
  videos: 'videos',
  reportDate: 'reportDate',
  gpsLocation: 'gpsLocation',
  volunteerNames: 'volunteerNames',
  status: 'status',
  createdById: 'createdById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MediaReportScalarFieldEnum = {
  id: 'id',
  eventReportId: 'eventReportId',
  type: 'type',
  url: 'url',
  thumbnail: 'thumbnail',
  uploadedById: 'uploadedById',
  createdAt: 'createdAt'
};

exports.Prisma.FamilyScalarFieldEnum = {
  id: 'id',
  familyName: 'familyName',
  headOfHouseholdId: 'headOfHouseholdId',
  members: 'members',
  contactPhone: 'contactPhone',
  address: 'address',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ChurchFeedbackScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  userName: 'userName',
  rating: 'rating',
  category: 'category',
  comment: 'comment',
  isAnonymous: 'isAnonymous',
  emoji: 'emoji',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GivingHeroConfigScalarFieldEnum = {
  id: 'id',
  headline: 'headline',
  subtitle: 'subtitle',
  backgroundImageUrl: 'backgroundImageUrl',
  backgroundType: 'backgroundType',
  badgeText: 'badgeText',
  ctaPrimaryText: 'ctaPrimaryText',
  ctaPrimaryHref: 'ctaPrimaryHref',
  ctaSecondaryText: 'ctaSecondaryText',
  ctaSecondaryHref: 'ctaSecondaryHref',
  campaignBannerText: 'campaignBannerText',
  campaignBannerHref: 'campaignBannerHref',
  securityBadges: 'securityBadges',
  statistics: 'statistics',
  isActive: 'isActive',
  updatedAt: 'updatedAt'
};

exports.Prisma.DonationPurposeScalarFieldEnum = {
  id: 'id',
  code: 'code',
  nameEn: 'nameEn',
  nameTe: 'nameTe',
  nameHi: 'nameHi',
  descEn: 'descEn',
  descTe: 'descTe',
  descHi: 'descHi',
  targetAmount: 'targetAmount',
  raisedAmount: 'raisedAmount',
  imageUrl: 'imageUrl',
  icon: 'icon',
  colorTheme: 'colorTheme',
  category: 'category',
  sortOrder: 'sortOrder',
  isActive: 'isActive',
  isArchived: 'isArchived',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DonationAmountScalarFieldEnum = {
  id: 'id',
  amount: 'amount',
  currency: 'currency',
  label: 'label',
  displayOrder: 'displayOrder',
  isActive: 'isActive',
  isDefault: 'isDefault',
  campaignId: 'campaignId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DonationFormFieldScalarFieldEnum = {
  id: 'id',
  fieldName: 'fieldName',
  label: 'label',
  placeholder: 'placeholder',
  isRequired: 'isRequired',
  isVisible: 'isVisible',
  displayOrder: 'displayOrder',
  fieldType: 'fieldType',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DonationSessionScalarFieldEnum = {
  id: 'id',
  memberId: 'memberId',
  branchId: 'branchId',
  purposeId: 'purposeId',
  amount: 'amount',
  currency: 'currency',
  referenceNumber: 'referenceNumber',
  razorpayOrderId: 'razorpayOrderId',
  campaignId: 'campaignId',
  campaignName: 'campaignName',
  donorName: 'donorName',
  donorEmail: 'donorEmail',
  donorPhone: 'donorPhone',
  panNumber: 'panNumber',
  prayerRequest: 'prayerRequest',
  notes: 'notes',
  isAnonymous: 'isAnonymous',
  upiUri: 'upiUri',
  qrCodeData: 'qrCodeData',
  qrGenerationCount: 'qrGenerationCount',
  paymentState: 'paymentState',
  blockedReason: 'blockedReason',
  status: 'status',
  expiresAt: 'expiresAt',
  ipAddress: 'ipAddress',
  device: 'device',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentTransactionScalarFieldEnum = {
  id: 'id',
  sessionId: 'sessionId',
  utr: 'utr',
  amount: 'amount',
  currency: 'currency',
  status: 'status',
  gateway: 'gateway',
  payload: 'payload',
  signature: 'signature',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ReceiptScalarFieldEnum = {
  id: 'id',
  receiptNumber: 'receiptNumber',
  donationId: 'donationId',
  memberId: 'memberId',
  referenceNumber: 'referenceNumber',
  amount: 'amount',
  currency: 'currency',
  issuedAt: 'issuedAt',
  pdfUrl: 'pdfUrl',
  verificationCode: 'verificationCode',
  qrCode: 'qrCode',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentWebhookScalarFieldEnum = {
  id: 'id',
  payload: 'payload',
  signature: 'signature',
  ipAddress: 'ipAddress',
  status: 'status',
  webhookEventId: 'webhookEventId',
  errorMessage: 'errorMessage',
  processedAt: 'processedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationLogScalarFieldEnum = {
  id: 'id',
  notificationId: 'notificationId',
  recipientId: 'recipientId',
  recipientRole: 'recipientRole',
  donationId: 'donationId',
  receiptId: 'receiptId',
  receiptNumber: 'receiptNumber',
  channel: 'channel',
  status: 'status',
  recipient_addr: 'recipient_addr',
  retryCount: 'retryCount',
  deliveredAt: 'deliveredAt',
  errorMessage: 'errorMessage',
  sentAt: 'sentAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  action: 'action',
  details: 'details',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  createdAt: 'createdAt'
};

exports.Prisma.DeviceTokenScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  token: 'token',
  deviceType: 'deviceType',
  platform: 'platform',
  lastUsedAt: 'lastUsedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ChurchServiceScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  title: 'title',
  shortDescription: 'shortDescription',
  description: 'description',
  serviceType: 'serviceType',
  icon: 'icon',
  iconColor: 'iconColor',
  cardColor: 'cardColor',
  badgeColor: 'badgeColor',
  imageUrl: 'imageUrl',
  imagePublicId: 'imagePublicId',
  branchId: 'branchId',
  speakerName: 'speakerName',
  serviceDay: 'serviceDay',
  frequency: 'frequency',
  occurrence: 'occurrence',
  startTime: 'startTime',
  endTime: 'endTime',
  timezone: 'timezone',
  location: 'location',
  googleMapsUrl: 'googleMapsUrl',
  capacity: 'capacity',
  registrationEnabled: 'registrationEnabled',
  registrationLimit: 'registrationLimit',
  featured: 'featured',
  displayOrder: 'displayOrder',
  status: 'status',
  seoTitle: 'seoTitle',
  seoDescription: 'seoDescription',
  tags: 'tags',
  language: 'language',
  isDeleted: 'isDeleted',
  createdById: 'createdById',
  updatedById: 'updatedById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.EventCategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  description: 'description',
  color: 'color',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EventAttendanceScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  registrationId: 'registrationId',
  memberId: 'memberId',
  name: 'name',
  email: 'email',
  attendedAt: 'attendedAt',
  checkedInBy: 'checkedInBy'
};

exports.Prisma.EventNotificationScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  type: 'type',
  title: 'title',
  content: 'content',
  sentAt: 'sentAt',
  channels: 'channels'
};

exports.Prisma.HomepageHeroScalarFieldEnum = {
  id: 'id',
  headline: 'headline',
  subheadline: 'subheadline',
  subtitle: 'subtitle',
  badgeText: 'badgeText',
  ctaPrimaryText: 'ctaPrimaryText',
  ctaPrimaryHref: 'ctaPrimaryHref',
  ctaSecondaryText: 'ctaSecondaryText',
  ctaSecondaryHref: 'ctaSecondaryHref',
  ctaTertiaryText: 'ctaTertiaryText',
  ctaTertiaryHref: 'ctaTertiaryHref',
  backgroundImageUrl: 'backgroundImageUrl',
  backgroundImageId: 'backgroundImageId',
  backgroundVideoUrl: 'backgroundVideoUrl',
  backgroundType: 'backgroundType',
  isActive: 'isActive',
  updatedById: 'updatedById',
  updatedAt: 'updatedAt'
};

exports.Prisma.SiteStatisticScalarFieldEnum = {
  id: 'id',
  key: 'key',
  label: 'label',
  labelTe: 'labelTe',
  labelHi: 'labelHi',
  value: 'value',
  icon: 'icon',
  colorScheme: 'colorScheme',
  autoCompute: 'autoCompute',
  computeFrom: 'computeFrom',
  displayOrder: 'displayOrder',
  isActive: 'isActive',
  updatedById: 'updatedById',
  updatedAt: 'updatedAt'
};

exports.Prisma.SiteContactScalarFieldEnum = {
  id: 'id',
  branchKey: 'branchKey',
  branchName: 'branchName',
  branchNameTe: 'branchNameTe',
  branchNameHi: 'branchNameHi',
  address: 'address',
  addressTe: 'addressTe',
  addressHi: 'addressHi',
  phones: 'phones',
  email: 'email',
  mapsUrl: 'mapsUrl',
  embedUrl: 'embedUrl',
  isStreetView: 'isStreetView',
  serviceHours: 'serviceHours',
  whatsappUrl: 'whatsappUrl',
  displayOrder: 'displayOrder',
  isActive: 'isActive',
  updatedAt: 'updatedAt'
};

exports.Prisma.FooterConfigScalarFieldEnum = {
  id: 'id',
  tagline: 'tagline',
  taglineTe: 'taglineTe',
  address: 'address',
  mapsUrl: 'mapsUrl',
  phones: 'phones',
  email: 'email',
  instagramUrl: 'instagramUrl',
  youtubeUrl: 'youtubeUrl',
  facebookUrl: 'facebookUrl',
  twitterUrl: 'twitterUrl',
  copyright: 'copyright',
  updatedById: 'updatedById',
  updatedAt: 'updatedAt'
};

exports.Prisma.NavigationItemScalarFieldEnum = {
  id: 'id',
  label: 'label',
  labelTe: 'labelTe',
  labelHi: 'labelHi',
  href: 'href',
  placement: 'placement',
  displayOrder: 'displayOrder',
  isActive: 'isActive',
  openInNew: 'openInNew',
  icon: 'icon',
  updatedAt: 'updatedAt'
};

exports.Prisma.AboutConfigScalarFieldEnum = {
  id: 'id',
  sectionBadge: 'sectionBadge',
  heading: 'heading',
  headingTe: 'headingTe',
  headingHi: 'headingHi',
  subtitle: 'subtitle',
  subtitleTe: 'subtitleTe',
  subtitleHi: 'subtitleHi',
  missionTitle: 'missionTitle',
  missionText: 'missionText',
  values: 'values',
  updatedById: 'updatedById',
  updatedAt: 'updatedAt'
};

exports.Prisma.DonationAgentEventScalarFieldEnum = {
  id: 'id',
  sessionId: 'sessionId',
  donationId: 'donationId',
  memberId: 'memberId',
  event: 'event',
  fromState: 'fromState',
  toState: 'toState',
  metadata: 'metadata',
  ip: 'ip',
  userAgent: 'userAgent',
  createdAt: 'createdAt'
};

exports.Prisma.DonationRetryJobScalarFieldEnum = {
  id: 'id',
  donationId: 'donationId',
  sessionId: 'sessionId',
  jobType: 'jobType',
  status: 'status',
  attempts: 'attempts',
  maxAttempts: 'maxAttempts',
  nextRetryAt: 'nextRetryAt',
  lastError: 'lastError',
  payload: 'payload',
  completedAt: 'completedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AgentReachTaskScalarFieldEnum = {
  id: 'id',
  agentType: 'agentType',
  status: 'status',
  query: 'query',
  parameters: 'parameters',
  summaryResult: 'summaryResult',
  markdownReport: 'markdownReport',
  error: 'error',
  createdById: 'createdById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  completedAt: 'completedAt'
};

exports.Prisma.AgentReachSourceScalarFieldEnum = {
  id: 'id',
  taskId: 'taskId',
  sourceType: 'sourceType',
  title: 'title',
  url: 'url',
  author: 'author',
  publishedAt: 'publishedAt',
  snippet: 'snippet',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.ChurchNewsArticleScalarFieldEnum = {
  id: 'id',
  category: 'category',
  title: 'title',
  sourceName: 'sourceName',
  sourceUrl: 'sourceUrl',
  summary: 'summary',
  content: 'content',
  imageUrl: 'imageUrl',
  publishedAt: 'publishedAt',
  fetchedAt: 'fetchedAt'
};

exports.Prisma.FirecrawlScrapeJobScalarFieldEnum = {
  id: 'id',
  jobType: 'jobType',
  targetUrl: 'targetUrl',
  query: 'query',
  status: 'status',
  scrapedContent: 'scrapedContent',
  markdown: 'markdown',
  metadata: 'metadata',
  error: 'error',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SermonResearchSummaryScalarFieldEnum = {
  id: 'id',
  topic: 'topic',
  scriptureRef: 'scriptureRef',
  summaryText: 'summaryText',
  keyTakeaways: 'keyTakeaways',
  theologicalThemes: 'theologicalThemes',
  sermonOutline: 'sermonOutline',
  scrapedSources: 'scrapedSources',
  createdById: 'createdById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ChurchNewsItemScalarFieldEnum = {
  id: 'id',
  category: 'category',
  title: 'title',
  sourceName: 'sourceName',
  sourceUrl: 'sourceUrl',
  summary: 'summary',
  contentMd: 'contentMd',
  imageUrl: 'imageUrl',
  publishedAt: 'publishedAt',
  isFeatured: 'isFeatured',
  fetchedAt: 'fetchedAt'
};

exports.Prisma.BibleStudyResourceScalarFieldEnum = {
  id: 'id',
  resourceType: 'resourceType',
  title: 'title',
  author: 'author',
  scriptureRef: 'scriptureRef',
  summary: 'summary',
  bodyMd: 'bodyMd',
  sourceUrl: 'sourceUrl',
  tags: 'tags',
  storedInApp: 'storedInApp',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EventContentGenLogScalarFieldEnum = {
  id: 'id',
  eventId: 'eventId',
  topic: 'topic',
  targetAudience: 'targetAudience',
  socialCaptions: 'socialCaptions',
  blogMarkdown: 'blogMarkdown',
  blogTitle: 'blogTitle',
  bannerImageUrl: 'bannerImageUrl',
  cloudinaryId: 'cloudinaryId',
  createdById: 'createdById',
  createdAt: 'createdAt'
};

exports.Prisma.NgoOpportunityScalarFieldEnum = {
  id: 'id',
  organization: 'organization',
  title: 'title',
  opportunityType: 'opportunityType',
  description: 'description',
  location: 'location',
  linkUrl: 'linkUrl',
  deadline: 'deadline',
  tags: 'tags',
  scrapedAt: 'scrapedAt'
};

exports.Prisma.WebsiteMonitorTargetScalarFieldEnum = {
  id: 'id',
  siteName: 'siteName',
  targetUrl: 'targetUrl',
  checkFrequency: 'checkFrequency',
  cssSelector: 'cssSelector',
  lastHash: 'lastHash',
  lastContent: 'lastContent',
  isActive: 'isActive',
  lastCheckedAt: 'lastCheckedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WebsiteMonitorLogScalarFieldEnum = {
  id: 'id',
  targetId: 'targetId',
  changeDetected: 'changeDetected',
  diffSummary: 'diffSummary',
  snapshotHash: 'snapshotHash',
  notificationSent: 'notificationSent',
  checkedAt: 'checkedAt'
};

exports.Prisma.AIChatLogScalarFieldEnum = {
  id: 'id',
  assistantType: 'assistantType',
  userId: 'userId',
  userRole: 'userRole',
  prompt: 'prompt',
  response: 'response',
  provider: 'provider',
  modelName: 'modelName',
  latencyMs: 'latencyMs',
  status: 'status',
  isFlagged: 'isFlagged',
  moderationReason: 'moderationReason',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.SmsMessageScalarFieldEnum = {
  id: 'id',
  notificationId: 'notificationId',
  memberId: 'memberId',
  phoneNumber: 'phoneNumber',
  normalizedPhoneNumber: 'normalizedPhoneNumber',
  message: 'message',
  provider: 'provider',
  providerMessageId: 'providerMessageId',
  idempotencyKey: 'idempotencyKey',
  status: 'status',
  attempts: 'attempts',
  maxAttempts: 'maxAttempts',
  scheduledAt: 'scheduledAt',
  sentAt: 'sentAt',
  deliveredAt: 'deliveredAt',
  failedAt: 'failedAt',
  expiresAt: 'expiresAt',
  failureReason: 'failureReason',
  errorCode: 'errorCode',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MemberNotificationPreferenceScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  smsEnabled: 'smsEnabled',
  emailEnabled: 'emailEnabled',
  pushEnabled: 'pushEnabled',
  events: 'events',
  sundayService: 'sundayService',
  prayerMeetings: 'prayerMeetings',
  sermons: 'sermons',
  specialPrograms: 'specialPrograms',
  donations: 'donations',
  emergencyAlerts: 'emergencyAlerts',
  youthPrograms: 'youthPrograms',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SmsAuditLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  role: 'role',
  action: 'action',
  recipientCount: 'recipientCount',
  template: 'template',
  provider: 'provider',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  status: 'status',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.UserRole = exports.$Enums.UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  PASTOR: 'PASTOR',
  MEMBER: 'MEMBER',
  EVENT_MANAGER: 'EVENT_MANAGER',
  FIELD_VOLUNTEER: 'FIELD_VOLUNTEER',
  NGO_ADMIN: 'NGO_ADMIN',
  BRANCH_MANAGER: 'BRANCH_MANAGER',
  MEDIA_TEAM: 'MEDIA_TEAM'
};

exports.Priority = exports.$Enums.Priority = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

exports.EventStatus = exports.$Enums.EventStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED'
};

exports.EventVisibility = exports.$Enums.EventVisibility = {
  PUBLIC: 'PUBLIC',
  MEMBERS_ONLY: 'MEMBERS_ONLY',
  PRIVATE: 'PRIVATE'
};

exports.SermonVisibility = exports.$Enums.SermonVisibility = {
  PUBLIC: 'PUBLIC',
  MEMBERS_ONLY: 'MEMBERS_ONLY',
  PRIVATE: 'PRIVATE'
};

exports.SermonStatus = exports.$Enums.SermonStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED'
};

exports.PrayerCategory = exports.$Enums.PrayerCategory = {
  HEALTH: 'HEALTH',
  FAMILY: 'FAMILY',
  FINANCIAL: 'FINANCIAL',
  SPIRITUAL: 'SPIRITUAL',
  GUIDANCE: 'GUIDANCE',
  THANKSGIVING: 'THANKSGIVING',
  OTHER: 'OTHER'
};

exports.PrayerStatus = exports.$Enums.PrayerStatus = {
  PENDING: 'PENDING',
  PRAYING: 'PRAYING',
  ANSWERED: 'ANSWERED'
};

exports.DonationStatus = exports.$Enums.DonationStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
  REFUNDED: 'REFUNDED'
};

exports.PledgeStatus = exports.$Enums.PledgeStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  FULFILLED: 'FULFILLED'
};

exports.TransactionType = exports.$Enums.TransactionType = {
  INFLOW: 'INFLOW',
  OUTFLOW: 'OUTFLOW'
};

exports.FeedbackCategory = exports.$Enums.FeedbackCategory = {
  WORSHIP: 'WORSHIP',
  SERMONS: 'SERMONS',
  EVENTS: 'EVENTS',
  COMMUNITY: 'COMMUNITY',
  FACILITIES: 'FACILITIES',
  ONLINE_PLATFORM: 'ONLINE_PLATFORM',
  LEADERSHIP: 'LEADERSHIP',
  OVERALL: 'OVERALL'
};

exports.ServiceFreq = exports.$Enums.ServiceFreq = {
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  DAILY: 'DAILY',
  SPECIAL: 'SPECIAL'
};

exports.ServiceStatus = exports.$Enums.ServiceStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED'
};

exports.SmsStatus = exports.$Enums.SmsStatus = {
  QUEUED: 'QUEUED',
  PROCESSING: 'PROCESSING',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  RETRYING: 'RETRYING',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED'
};

exports.SmsErrorCode = exports.$Enums.SmsErrorCode = {
  TRANSIENT_ERROR: 'TRANSIENT_ERROR',
  PERMANENT_ERROR: 'PERMANENT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  INVALID_NUMBER: 'INVALID_NUMBER',
  EXPIRED_MESSAGE: 'EXPIRED_MESSAGE',
  GATEWAY_OFFLINE: 'GATEWAY_OFFLINE',
  UNKNOWN: 'UNKNOWN'
};

exports.Prisma.ModelName = {
  User: 'User',
  Session: 'Session',
  Event: 'Event',
  EventMedia: 'EventMedia',
  EventImage: 'EventImage',
  EventVideo: 'EventVideo',
  EventRegistration: 'EventRegistration',
  Sermon: 'Sermon',
  SermonMedia: 'SermonMedia',
  SermonAudio: 'SermonAudio',
  SermonNotes: 'SermonNotes',
  SermonView: 'SermonView',
  SermonLike: 'SermonLike',
  SermonComment: 'SermonComment',
  SermonDownload: 'SermonDownload',
  SermonBookmark: 'SermonBookmark',
  PrayerRequest: 'PrayerRequest',
  Donation: 'Donation',
  Announcement: 'Announcement',
  Testimonial: 'Testimonial',
  Ministry: 'Ministry',
  Pastor: 'Pastor',
  Gallery: 'Gallery',
  ContactMessage: 'ContactMessage',
  Notification: 'Notification',
  ChurchSettings: 'ChurchSettings',
  MemberRequest: 'MemberRequest',
  SmallGroup: 'SmallGroup',
  Volunteer: 'Volunteer',
  BibleStudy: 'BibleStudy',
  AttendanceRecord: 'AttendanceRecord',
  Pledge: 'Pledge',
  Transaction: 'Transaction',
  Account: 'Account',
  NgoProject: 'NgoProject',
  NgoMedia: 'NgoMedia',
  NgoVolunteer: 'NgoVolunteer',
  Branch: 'Branch',
  EventReport: 'EventReport',
  MediaReport: 'MediaReport',
  Family: 'Family',
  ChurchFeedback: 'ChurchFeedback',
  GivingHeroConfig: 'GivingHeroConfig',
  DonationPurpose: 'DonationPurpose',
  DonationAmount: 'DonationAmount',
  DonationFormField: 'DonationFormField',
  DonationSession: 'DonationSession',
  PaymentTransaction: 'PaymentTransaction',
  Receipt: 'Receipt',
  PaymentWebhook: 'PaymentWebhook',
  NotificationLog: 'NotificationLog',
  AuditLog: 'AuditLog',
  DeviceToken: 'DeviceToken',
  ChurchService: 'ChurchService',
  EventCategory: 'EventCategory',
  EventAttendance: 'EventAttendance',
  EventNotification: 'EventNotification',
  HomepageHero: 'HomepageHero',
  SiteStatistic: 'SiteStatistic',
  SiteContact: 'SiteContact',
  FooterConfig: 'FooterConfig',
  NavigationItem: 'NavigationItem',
  AboutConfig: 'AboutConfig',
  DonationAgentEvent: 'DonationAgentEvent',
  DonationRetryJob: 'DonationRetryJob',
  AgentReachTask: 'AgentReachTask',
  AgentReachSource: 'AgentReachSource',
  ChurchNewsArticle: 'ChurchNewsArticle',
  FirecrawlScrapeJob: 'FirecrawlScrapeJob',
  SermonResearchSummary: 'SermonResearchSummary',
  ChurchNewsItem: 'ChurchNewsItem',
  BibleStudyResource: 'BibleStudyResource',
  EventContentGenLog: 'EventContentGenLog',
  NgoOpportunity: 'NgoOpportunity',
  WebsiteMonitorTarget: 'WebsiteMonitorTarget',
  WebsiteMonitorLog: 'WebsiteMonitorLog',
  AIChatLog: 'AIChatLog',
  SmsMessage: 'SmsMessage',
  MemberNotificationPreference: 'MemberNotificationPreference',
  SmsAuditLog: 'SmsAuditLog'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
