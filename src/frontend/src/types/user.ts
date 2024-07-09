export interface User {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  fullName?: string;

  avatar?: string;
  created_at?: string;
  created_by?: string;
  last_login?: string;
  updated_at?:string;
}
