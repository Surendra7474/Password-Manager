export interface Profile {
  id: string;
  name: string;
  phone_number: string | null;
  pin: string;
  created_at: string;
  updated_at: string;
}

export interface StoredPassword {
  id: string;
  user_id: string;
  title: string;
  username: string;
  password: string;
  created_at: string;
  updated_at: string;
}

export interface PinAttempt {
  id: string;
  user_id: string;
  success: boolean;
  created_at: string;
}