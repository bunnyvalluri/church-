/**
 * src/modules/branches/branches.service.ts
 * Hyderabad 3 Campus Branches Service (Kukatpally, Banjara Hills, Secunderabad).
 */

import { HYDERABAD_BRANCHES } from '../../shared/constants';
import { NotFoundError } from '../../shared/errors';

export class BranchesService {
  public getAllBranches() {
    return HYDERABAD_BRANCHES;
  }

  public getBranchById(idOrSlug: string) {
    const branch = HYDERABAD_BRANCHES.find(
      (b) => b.id === idOrSlug || b.slug === idOrSlug
    );
    if (!branch) throw new NotFoundError('Church Branch');
    return branch;
  }
}

export const branchesService = new BranchesService();

