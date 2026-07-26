import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface FamilyRecord {
  id: string;
  familyName: string;
  headOfHouseholdId: string;
  members: string[]; // User IDs
  contactPhone: string;
  address: string;
  anniversaryDate?: string;
  branchName?: string;
  notes?: string;
  createdAt: string;
}

// In-memory store initialized with seed families
let familiesStore: FamilyRecord[] = [
  {
    id: "fam_001",
    familyName: "Valluri Household",
    headOfHouseholdId: "user_super_admin_001",
    members: ["user_super_admin_001", "user_admin_002", "user_member_004"],
    contactPhone: "+91 96409 43777",
    address: "15-201, Vivekananda Nagar, Jeedimetla, Hyderabad",
    anniversaryDate: "2015-11-26",
    branchName: "Shapur Nagar Sanctuary",
    notes: "Active ministry supporters and prayer group hosts.",
    createdAt: new Date().toISOString()
  },
  {
    id: "fam_002",
    familyName: "Raju Family",
    headOfHouseholdId: "user_pastor_003",
    members: ["user_pastor_003", "user_member_005"],
    contactPhone: "+91 87654 32109",
    address: "Subhash Nagar Sanctuary Road, Hyderabad",
    anniversaryDate: "2012-04-18",
    branchName: "Subhash Nagar",
    notes: "Worship ministry and choir leaders.",
    createdAt: new Date().toISOString()
  },
  {
    id: "fam_003",
    familyName: "Reddy Household",
    headOfHouseholdId: "user_member_006",
    members: ["user_member_006", "user_member_007", "user_member_008"],
    contactPhone: "+91 65432 10987",
    address: "Kompally Family Quarters, Hyderabad",
    anniversaryDate: "2019-08-09",
    branchName: "Bahadurpally",
    notes: "Sunday School teachers family.",
    createdAt: new Date().toISOString()
  },
  {
    id: "fam_004",
    familyName: "Sharma Family",
    headOfHouseholdId: "user_member_009",
    members: ["user_member_009", "user_member_010"],
    contactPhone: "+91 98765 12345",
    address: "Suchitra Circle, Quthbullapur, Hyderabad",
    anniversaryDate: "2021-02-14",
    branchName: "Shapur Nagar Sanctuary",
    notes: "New believers family unit.",
    createdAt: new Date().toISOString()
  }
];

// GET: Fetch all families
export async function GET(req: Request) {
  try {
    return NextResponse.json({ success: true, families: familiesStore });
  } catch (err: any) {
    console.error('[ADMIN/FAMILIES/GET] Error:', err);
    return NextResponse.json({ error: err?.message || 'Server error occurred' }, { status: 500 });
  }
}

// POST: Create a new family
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { familyName, headOfHouseholdId, contactPhone, address, members, anniversaryDate, branchName, notes } = body;

    if (!familyName) {
      return NextResponse.json({ error: 'Family name is required' }, { status: 400 });
    }

    const newHeadId = headOfHouseholdId || "user_super_admin_001";
    const initialMembers = Array.isArray(members) && members.length > 0 
      ? Array.from(new Set([newHeadId, ...members])) 
      : [newHeadId];

    const created: FamilyRecord = {
      id: `fam_${Date.now()}`,
      familyName,
      headOfHouseholdId: newHeadId,
      members: initialMembers,
      contactPhone: contactPhone || '+91 96409 43777',
      address: address || 'Jeedimetla, Hyderabad',
      anniversaryDate: anniversaryDate || '',
      branchName: branchName || 'Shapur Nagar Sanctuary',
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    familiesStore = [created, ...familiesStore];

    return NextResponse.json({ success: true, family: created, families: familiesStore });
  } catch (err: any) {
    console.error('[ADMIN/FAMILIES/POST] Error:', err);
    return NextResponse.json({ error: err?.message || 'Server error occurred' }, { status: 500 });
  }
}

// PATCH: Update family details or roster
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, familyName, headOfHouseholdId, contactPhone, address, members, anniversaryDate, branchName, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Family ID is required' }, { status: 400 });
    }

    const index = familiesStore.findIndex(f => f.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Family record not found' }, { status: 404 });
    }

    const existing = familiesStore[index];
    const updated: FamilyRecord = {
      ...existing,
      ...(familyName && { familyName }),
      ...(headOfHouseholdId && { headOfHouseholdId }),
      ...(contactPhone !== undefined && { contactPhone }),
      ...(address !== undefined && { address }),
      ...(members !== undefined && { members }),
      ...(anniversaryDate !== undefined && { anniversaryDate }),
      ...(branchName !== undefined && { branchName }),
      ...(notes !== undefined && { notes }),
    };

    familiesStore[index] = updated;

    return NextResponse.json({ success: true, family: updated, families: familiesStore });
  } catch (err: any) {
    console.error('[ADMIN/FAMILIES/PATCH] Error:', err);
    return NextResponse.json({ error: err?.message || 'Server error occurred' }, { status: 500 });
  }
}

// DELETE: Delete a family
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Family ID is required' }, { status: 400 });
    }

    familiesStore = familiesStore.filter(f => f.id !== id);

    return NextResponse.json({ success: true, message: 'Family deleted successfully', families: familiesStore });
  } catch (err: any) {
    console.error('[ADMIN/FAMILIES/DELETE] Error:', err);
    return NextResponse.json({ error: err?.message || 'Server error occurred' }, { status: 500 });
  }
}
