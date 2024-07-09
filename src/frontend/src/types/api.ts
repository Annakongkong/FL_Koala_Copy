export interface APIResponse<T> {
    code: number;
    data: T;
    success: boolean;
    message: string;
    timestamp: string;
}

export interface LoginData {
    access_token: string;
    user: {
    //   avatar: string | null;
    //   created_at: string;
    //   created_by: string | null;
      email: string;
      id: number;
    //   last_login: string | null;
      role_id: number;
    //   updated_at: string;
      username: string;
    };
}

export interface CurrentUserData {
    email: string;
    id: number;
    role_id: number;
    username: string;    
    avatar?: string;
    fullname: string;
}