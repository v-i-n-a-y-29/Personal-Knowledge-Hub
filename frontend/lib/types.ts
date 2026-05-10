export type User = {
  email: string;
  created_at: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
};

export type Resource = {
  id: string;
  user_id: string;
  title: string;
  url: string;
  description: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type ResourcePayload = {
  title: string;
  url: string;
  description?: string;
  tags: string[];
};
