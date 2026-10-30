/**
 * src/modules/ngo/ngo.service.ts
 * KCM NGO Outreach, Community Care & Charity Programs service.
 */

export interface NgoProject {
  id: string;
  title: string;
  description: string;
  beneficiariesCount: number;
  location: string;
  status: 'ACTIVE' | 'COMPLETED';
}

const DEFAULT_NGO_PROJECTS: NgoProject[] = [
  {
    id: 'ngo_feeding_hyderabad',
    title: 'Daily Hunger Relief & Slum Feeding Initiative',
    description: 'Providing nutritious meals and clean drinking water to needy families across Hyderabad slums.',
    beneficiariesCount: 15400,
    location: 'Hyderabad, Telangana',
    status: 'ACTIVE',
  },
  {
    id: 'ngo_education_support',
    title: 'Children Education & School Supplies Support',
    description: 'Supporting underprivileged children with tuition fees, books, and uniforms.',
    beneficiariesCount: 4200,
    location: 'Secunderabad & Surrounding Villages',
    status: 'ACTIVE',
  },
];

export class NgoService {
  public getProjects() {
    return DEFAULT_NGO_PROJECTS;
  }

  public getStats() {
    const totalBeneficiaries = DEFAULT_NGO_PROJECTS.reduce((acc, p) => acc + p.beneficiariesCount, 0);
    return {
      activeProjectsCount: DEFAULT_NGO_PROJECTS.length,
      totalBeneficiaries,
      citiesReached: ['Hyderabad', 'Secunderabad', 'Rangareddy'],
    };
  }
}

export const ngoService = new NgoService();

