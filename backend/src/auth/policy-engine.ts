import { PolicyRequirement, AuthorizedUser } from './types';

function hasPermission(user: AuthorizedUser, permission: string): boolean {
  return user.permissions.includes(permission);
}

function attributesMatch(user: AuthorizedUser, key: string, values: unknown[]): boolean {
  const attributeValue = user.attributes?.[key];
  if (Array.isArray(attributeValue)) {
    return attributeValue.some((value) => values.includes(value));
  }
  return values.includes(attributeValue);
}

export function evaluatePolicy(user: AuthorizedUser, requirement: PolicyRequirement): boolean {
  if (requirement.all && requirement.all.length > 0) {
    const allMatch = requirement.all.every((permission) => hasPermission(user, permission));
    if (!allMatch) {
      return false;
    }
  }

  if (requirement.any && requirement.any.length > 0) {
    const anyMatch = requirement.any.some((permission) => hasPermission(user, permission));
    if (!anyMatch) {
      return false;
    }
  }

  if (requirement.attributes && requirement.attributes.length > 0) {
    const attributesValid = requirement.attributes.every(({ key, values }) =>
      attributesMatch(user, key, values)
    );
    if (!attributesValid) {
      return false;
    }
  }

  return true;
}


