export type MemberStatus = "good-standing" | "suspended" | "pending";
export type MembershipType = "monthly" | "annual" | "none";

export interface Member {
  id: string;
  name: string;
  email: string;
  status: MemberStatus;
  rankingScore: number;
  membershipType: MembershipType;
  joinedDate: string;
  completedCourses: boolean;
}

let memberStore: Member[] = [
  {
    id: "m1",
    name: "Alice Johnson",
    email: "alice@example.com",
    status: "good-standing",
    rankingScore: 92,
    membershipType: "monthly",
    joinedDate: "2026-01-15",
    completedCourses: true,
  },
  {
    id: "m2",
    name: "Bob Smith",
    email: "bob@example.com",
    status: "good-standing",
    rankingScore: 78,
    membershipType: "annual",
    joinedDate: "2026-02-20",
    completedCourses: true,
  },
  {
    id: "m3",
    name: "Carol Davis",
    email: "carol@example.com",
    status: "suspended",
    rankingScore: 45,
    membershipType: "monthly",
    joinedDate: "2026-03-10",
    completedCourses: true,
  },
  {
    id: "m4",
    name: "David Lee",
    email: "david@example.com",
    status: "pending",
    rankingScore: 0,
    membershipType: "none",
    joinedDate: "2026-06-17",
    completedCourses: false,
  },
  {
    id: "m5",
    name: "Eva Martinez",
    email: "eva@example.com",
    status: "good-standing",
    rankingScore: 88,
    membershipType: "monthly",
    joinedDate: "2026-04-05",
    completedCourses: true,
  },
  {
    id: "m6",
    name: "Frank Wilson",
    email: "frank@example.com",
    status: "good-standing",
    rankingScore: 95,
    membershipType: "annual",
    joinedDate: "2026-01-01",
    completedCourses: true,
  },
  {
    id: "m7",
    name: "Grace Kim",
    email: "grace@example.com",
    status: "suspended",
    rankingScore: 30,
    membershipType: "monthly",
    joinedDate: "2026-05-12",
    completedCourses: true,
  },
  {
    id: "m8",
    name: "Henry Brown",
    email: "henry@example.com",
    status: "pending",
    rankingScore: 0,
    membershipType: "none",
    joinedDate: "2026-06-18",
    completedCourses: false,
  },
];

export function getAllMembers(): Member[] {
  return [...memberStore];
}

export function getMemberById(id: string): Member | undefined {
  return memberStore.find((m) => m.id === id);
}

export function updateMemberStatus(
  id: string,
  status: MemberStatus
): Member | undefined {
  const idx = memberStore.findIndex((m) => m.id === id);
  if (idx === -1) return undefined;
  memberStore[idx] = { ...memberStore[idx], status };
  return { ...memberStore[idx] };
}

export function getMembersByStatus(status: MemberStatus): Member[] {
  return memberStore.filter((m) => m.status === status);
}

export function getSuspendedMembers(): Member[] {
  return getMembersByStatus("suspended");
}

export function getPendingMembers(): Member[] {
  return getMembersByStatus("pending");
}

export function getTopRankedMembers(limit = 10): Member[] {
  return [...memberStore]
    .sort((a, b) => b.rankingScore - a.rankingScore)
    .slice(0, limit);
}

export function getRecentSignups(days = 7): Member[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return memberStore.filter(
    (m) => new Date(m.joinedDate) >= cutoff
  );
}

export function approveMember(id: string): Member | undefined {
  return updateMemberStatus(id, "good-standing");
}

export function suspendMember(id: string): Member | undefined {
  return updateMemberStatus(id, "suspended");
}
