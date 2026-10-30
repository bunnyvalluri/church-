/**
 * src/constants/index.ts
 * Centralized Application Constants.
 */

export const APP_CONFIG = {
  name: 'Kingdom of Christ Ministries',
  shortName: 'KCM Church',
  phone: '+91 97040 90069',
  email: 'kingofchristministries23@gmail.com',
  address: '15-201, Vivekananda Nagar, Srinivas Nagar, Jeedimetla, Hyderabad, Telangana 500055',
  urls: {
    website: 'https://kcmchurch.org',
    liveStream: 'https://youtube.com/@kcmchurch',
  },
} as const;

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  PASTOR: 'PASTOR',
  EVENT_MANAGER: 'EVENT_MANAGER',
  FIELD_VOLUNTEER: 'FIELD_VOLUNTEER',
  MEMBER: 'MEMBER',
  NGO_ADMIN: 'NGO_ADMIN',
  GUEST: 'GUEST',
} as const;

export const CAMPUS_IDS = {
  KUKATPALLY: 'branch_kukatpally',
  BANJARA_HILLS: 'branch_banjara_hills',
  SECUNDERABAD: 'branch_secunderabad',
} as const;

