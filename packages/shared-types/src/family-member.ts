/**
 * Represents a user's membership in a family.
 *
 * Permissions are controlled by `role`:
 *   - "owner"  — full control (invite, remove, edit)
 *   - "member" — standard access (view, log entries)
 *
 * `relationship` is a free-form family label:
 *   - "Mom", "Dad", "Guardian", "Grandmother", "Grandfather", etc.
 *   - Any custom value is allowed.
 *
 * Roles and relationships are intentionally independent.
 */
export interface FamilyMember {
  id: string;
  userId: string;
  familyId: string;
  role: 'owner' | 'member';
  relationship: string;
  createdAt: string;
  updatedAt: string;
}
