export interface RoleDefinition {
  name: string;
  description?: string;
  permissions: string[];
  inherits?: string[];
}

export interface UserAttributes {
  location?: string;
  business_unit?: string;
  skills?: string[];
  project_ids?: number[];
  [key: string]: unknown;
}

export interface PolicyRequirement {
  any?: string[];
  all?: string[];
  attributes?: Array<{
    key: string;
    values: unknown[];
  }>;
}

export interface AuthorizedUser {
  id: number;
  email: string;
  role: string;
  permissions: string[];
  attributes: UserAttributes;
}


