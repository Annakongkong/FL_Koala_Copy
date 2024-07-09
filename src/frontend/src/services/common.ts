import type { APIResponse, CurrentUserData, LoginData } from '@/types/api';
import { ScriptRequest } from '@/types/script';
import { SignInWithPasswordParams } from '@/lib/auth/client';
import request from '@/lib/request';

interface LoginRequest {
  username: string;
  password: string;
}

// Define the login function
export async function login(loginData: LoginRequest): Promise<APIResponse<LoginData>> {
  return request<LoginData>({
    url: '/api/v2/login',
    method: 'POST',
    data: loginData,
  });
}

export async function getCurrentUser(): Promise<APIResponse<CurrentUserData>> {
  return request<CurrentUserData>({
    url: '/api/current_user',
    method: 'GET',
  });
}

interface CreateUserRequest {
  username: string;
  password: string;
  email: string;
  role: number;
  fullname: string;
}

interface CreateUserResponse {
  email: string;
  id: number;
  role: number;
  username: string;
  fullname: string;
}

// TODO add user functions
export async function createUser(newUserData: CreateUserRequest): Promise<APIResponse<CreateUserResponse>> {
  return request<CreateUserResponse>({
    url: '/api/users',
    method: 'POST',
    data: newUserData,
  });
}

// TODO remove user functions
export async function deleteUser(userId: number): Promise<APIResponse<LoginData>> {
  return request<LoginData>({
    url: `/api/users/${userId.toString()}`,
    method: 'DELETE',
  });
}

export interface ListUsersResponse {
  avatar?: string;
  created_at?: string;
  created_by?: string;
  email: string;
  id: number;
  last_login?: string;
  role_id: number;
  updated_at?: string;
  username: string;
}

// list users
export async function listUsers(): Promise<APIResponse<ListUsersResponse[]>> {
  return request<ListUsersResponse[]>({
    url: '/api/users',
    method: 'GET',
  });
}

export interface UpdateUserRequest {
  username?: string;
  password?: string;
  email: string;
  role?: number;
  avatar?: string;
}

interface UserResponse {
  avatar?: string;
  created_at?: string;
  created_by?: string;
  email: string;
  id: number;
  last_login?: string;
  role_id: number;
  updated_at?: string;
  username: string;
}

export async function updateUser(requestData: UpdateUserRequest): Promise<APIResponse<UserResponse>> {
  return request<UserResponse>({
    url: '/api/users',
    method: 'PUT',
    data: requestData,
  });
}

export async function getUserById(id: number): Promise<APIResponse<UserResponse>> {
  return request<UserResponse>({
    url: `/api/users/${id.toString()}`,
    method: 'GET',
  });
}

export interface ScriptResponse {
  code: string;
  created_time: string;
  description: string;
  instruction: string;
  label: string;
  script_id: number;
  script_name: string;
  status: string;
  updated_time: string;
  user_id: number;
  user_name: string;
  upload_required: boolean;
}

export async function fetchScript(id: number): Promise<APIResponse<ScriptResponse>> {
  return request<ScriptResponse>({
    url: `/api/scripts/get/${id.toString()}`,
    method: 'GET',
  });
}

interface EditScriptRequest {
  id: number;
  description: string;
  instruction: string;
  name: string;
  code: string;
  label: string;
  uploadRequired: boolean;
}

export async function updateScript(data: EditScriptRequest): Promise<APIResponse<ScriptResponse>> {
  return request<ScriptResponse>({
    url: `/api/scripts/update/${data.id.toString()}`,
    method: 'PUT',
    data,
  });
}

interface ExecuteScriptRequest {
  file: File;
  script_id: number;
  user_id: number;
  has_file: boolean;
}

interface ExecuteScriptResponse {
  created_at: string;
  end_time: string;
  id: number;
  output: string;
  script_id: number;
  start_time: string;
  status: string;
  updated_at: string;
  user_id: number;
}

export async function executeScript(formData: FormData): Promise<APIResponse<ExecuteScriptResponse>> {
  return request<ExecuteScriptResponse>({
    url: `/api/execute`,
    method: 'POST',
    data: formData,
  });
}

export async function downloadOutput(execId: number): Promise<APIResponse<Blob>> {
  return request<Blob>(
    {
      url: `/api/download/${execId.toString()}`,
      method: 'GET',
    },
    true
  );
}

export async function downloadLog(execId: number): Promise<APIResponse<string>> {
  return request<string>({
    url: `/api/download/${execId.toString()}/log`,
    method: 'GET',
  });
}

export interface ListScriptsResponse {
  description: string;
  script_id: string;
  script_name: string;
  status: boolean;
  updated_time: string;
  user_id: number;
  user_name: string;
  label: string;
  is_active: boolean;
  user_full_name: string;
}

export async function listScripts(): Promise<APIResponse<ListScriptsResponse[]>> {
  return request<ListScriptsResponse[]>({
    url: '/api/scripts/list',
    method: 'GET',
  });
}

export interface AddNewScriptResponse {
  id: string;
}

export async function addScript(data: ScriptRequest): Promise<APIResponse<AddNewScriptResponse>> {
  return request<{ id: string }>({
    url: '/api/scripts/add',
    method: 'POST',
    data,
  });
}

export async function deleteScript(scriptId: string): Promise<APIResponse<{}>> {
  return request<{}>({
    url: '/api/scripts/delete/' + scriptId,
    method: 'DELETE',
  });
}

export async function listFavScript(): Promise<APIResponse<string[]>> {
  return request<string[]>({
    url: '/api/list/favorite',
    method: 'GET',
  });
}

export interface FavScriptResponse {
  id: string;
  created_at: string;
  script_id: string;
  updated_at: string;
  user_id: string;
  user_name: string;
}

export async function favScript(scriptId: string): Promise<APIResponse<FavScriptResponse>> {
  return request<FavScriptResponse>({
    url: '/api/favorite/' + scriptId,
    method: 'POST',
  });
}

export async function unFavScript(scriptId: string): Promise<APIResponse<FavScriptResponse>> {
  return request<FavScriptResponse>({
    url: '/api/unfavorite/' + scriptId,
    method: 'DELETE',
  });
}

export interface FavScriptsDetailResponse {
  id: string;
  created_at: string;
  updated_at: string;
  description?: string;
  instruction?: string;
  label?: string;
  name: string;
  status: string;
  upload_required: boolean;
}

// /api/list/favorite/user
export async function listFavScriptDetials(): Promise<APIResponse<FavScriptsDetailResponse[]>> {
  return request<FavScriptsDetailResponse[]>({
    url: '/api/list/favorite/user',
    method: 'GET',
  });
}

// New functions to activate and deactivate scripts
export async function activateScript(scriptId: number): Promise<APIResponse<{}>> {
  return request<{}>({
    url: `/api/scripts/active/${scriptId}`,
    method: 'POST',
  });
}

export async function deactivateScript(scriptId: number): Promise<APIResponse<{}>> {
  return request<{}>({
    url: `/api/scripts/deactive/${scriptId}`,
    method: 'POST',
  });
}

export async function getActiveScripts(): Promise<APIResponse<number[]>> {
  return request<number[]>({
    url: '/api/scripts/active',
    method: 'GET',
  });
}

// 	"exec_id": 216,
//		"task_id": "65eea57c-2f93-443b-97dd-029d1ad0f32a"
interface ExecuteScriptV2Response {
  exec_id: number;
  task_id: string;
}
// /api/v2/execute
export async function executeScriptV2(formData: FormData): Promise<APIResponse<ExecuteScriptV2Response>> {
  return request<ExecuteScriptV2Response>({
    url: `/api/v2/execute`,
    method: 'POST',
    data: formData,
  });
}

export interface ExecutionListResponse {
  execution_id: string;
  task_id: string;
  script_name: string;
  status: string;
  startTime: string;
  endTime: string;
  script_id: string;
}

// Get execution
export async function listExecutions(id: string): Promise<APIResponse<ExecutionListResponse[]>> {
  return request<ExecutionListResponse[]>({
    url: '/api/executions/' + id,
    method: 'GET',
  });
}

interface resetAllPasswordsRequest {
  password: string;
}

// reset all password
export async function resetAllPasswords(data: resetAllPasswordsRequest): Promise<APIResponse<{}>> {
  return request<{}>({
    url: '/api/reset-passwords',
    method: 'POST',
    data,
  });
}

interface SpaceUsedResponse {
  data: string;
}
// get data space used
export async function getSpaceUsed(): Promise<APIResponse<SpaceUsedResponse>> {
  return request<SpaceUsedResponse>({
    url: '/api/data_space_used',
    method: 'GET',
  });
}
