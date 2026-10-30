/**
 * src/domain/user.entity.ts
 * Domain model and invariants for KCM Church Users & Members.
 */

import { UserRole } from '../types/auth.types';
import { BadRequestError } from '../shared/errors';

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly role: UserRole,
    public readonly branchId?: string | null,
    public readonly phone?: string | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.id) throw new BadRequestError('User ID is required');
    if (!this.email || !this.email.includes('@')) throw new BadRequestError('Valid user email is required');
    if (!this.name || this.name.trim().length === 0) throw new BadRequestError('User name is required');
  }

  public isStaffOrAdmin(): boolean {
    return ['SUPER_ADMIN', 'ADMIN', 'PASTOR', 'EVENT_MANAGER'].includes(this.role);
  }

  public canManageBranch(targetBranchId?: string | null): boolean {
    if (['SUPER_ADMIN', 'ADMIN'].includes(this.role)) return true;
    if (!targetBranchId || !this.branchId) return false;
    return this.branchId === targetBranchId;
  }
}

