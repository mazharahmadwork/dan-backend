export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  date_of_birth: string;
  age: number | null;
  country_id: string;
  verification_status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  full_name: string;
  date_of_birth: string;
  age?: number;
  country_id: string;
  verification_status?: string;
}

export interface UpdateUserDTO {
  email?: string;
  password?: string;
  full_name?: string;
  date_of_birth?: string;
  age?: number;
  country_id?: string;
  verification_status?: string;
}

/** User without password_hash, for API responses */
export type UserResponse = Omit<User, "password_hash">;
