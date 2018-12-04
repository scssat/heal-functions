export interface User {
  id?: string;
  active?: boolean;
  userType?: string;
  firstName?: string;
  lastName?: string;
  registered?: any;
  isActive?: any;
  birthDate?: any;
  gender?: string;
  accessCode?: string;
  displayName?: string;
  email?: string;
  phone1?: string;
  phone2?: string;
  password?: string;
  address?: string;
  address2?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  countryPhone?: any; // For future use
  avatarUrl?: string;
  agree?: boolean;
  agreeInfo?: boolean;
  agreeTerms?: boolean;
  blocked: boolean;
  ownForumId?: boolean;
  acceptStudy1?: boolean;
  acceptStudy2?: boolean;
  acceptInfo?: boolean;
  notARobot?: boolean;
  supportFollowers?: number;
  comment?: string;
  userTypeId?: string;
}
