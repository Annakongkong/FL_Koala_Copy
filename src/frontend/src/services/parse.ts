import { CurrentUserData, LoginData } from "@/types/api";
import { User } from "@/types/user";

export function parseUser(response: LoginData | CurrentUserData): User {
  let user: User;

  if ((response as LoginData).user !== undefined) {  //   LoginData
    const loginData = response as LoginData;
    user = {
      id: loginData.user.id.toString(),
      email: loginData.user.email,
      username: loginData.user.username,
      isAdmin: loginData.user.role_id === 0,
    };
  } else {  //   CurrentUserData
    const currentUserData = response as CurrentUserData;
    user = {
      id: currentUserData.id.toString(),
      email: currentUserData.email,
      username: currentUserData.username,
      avatar:  currentUserData.avatar ? `data:image/jpeg;base64,${currentUserData.avatar}`: undefined,
      isAdmin: currentUserData.role_id === 0,
      fullName: currentUserData.fullname
    };
  }
  return user;
}


