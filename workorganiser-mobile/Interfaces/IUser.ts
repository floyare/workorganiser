export interface IUser {
  [key: string]: string | boolean | null,
  avatar_url: string | null,
  email: string | null,
  email_verified: boolean | null,
  full_name: string | null,
  iss: string | null,
  name: string | null,
  preferred_username: string | null,
  provider_id: string | null,
  sub: string | null,
  user_name: string | null,
}