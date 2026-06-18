export type MatchStatus = "active" | "completed" | "cancelled" | "expired";

export interface MatchRecord {
  id: string;
  arrivingMemberName: string;
  arrivingMemberEmail: string;
  spotOwnerName: string;
  spotOwnerEmail: string;
  status: MatchStatus;
  matchedAt: string;
  arrivalAt: string | null;
  spotAddress: string;
}

let matchStore: MatchRecord[] = [
  {
    id: "m-001",
    arrivingMemberName: "Alice Johnson",
    arrivingMemberEmail: "alice@example.com",
    spotOwnerName: "Bob Smith",
    spotOwnerEmail: "bob@example.com",
    status: "active",
    matchedAt: "2026-06-18 09:30 AM",
    arrivalAt: null,
    spotAddress: "123 Pine Ave, Long Beach, CA",
  },
  {
    id: "m-002",
    arrivingMemberName: "Carol Davis",
    arrivingMemberEmail: "carol@example.com",
    spotOwnerName: "David Lee",
    spotOwnerEmail: "david@example.com",
    status: "completed",
    matchedAt: "2026-06-18 08:15 AM",
    arrivalAt: "2026-06-18 08:22 AM",
    spotAddress: "456 Elm St, Long Beach, CA",
  },
  {
    id: "m-003",
    arrivingMemberName: "Eva Martinez",
    arrivingMemberEmail: "eva@example.com",
    spotOwnerName: "Frank Wilson",
    spotOwnerEmail: "frank@example.com",
    status: "cancelled",
    matchedAt: "2026-06-17 05:45 PM",
    arrivalAt: null,
    spotAddress: "789 Oak Ave, Long Beach, CA",
  },
  {
    id: "m-004",
    arrivingMemberName: "Grace Kim",
    arrivingMemberEmail: "grace@example.com",
    spotOwnerName: "Henry Brown",
    spotOwnerEmail: "henry@example.com",
    status: "expired",
    matchedAt: "2026-06-17 02:00 PM",
    arrivalAt: null,
    spotAddress: "321 Maple Dr, Long Beach, CA",
  },
  {
    id: "m-005",
    arrivingMemberName: "Alice Johnson",
    arrivingMemberEmail: "alice@example.com",
    spotOwnerName: "Frank Wilson",
    spotOwnerEmail: "frank@example.com",
    status: "active",
    matchedAt: "2026-06-18 10:00 AM",
    arrivalAt: null,
    spotAddress: "555 Cedar Ln, Long Beach, CA",
  },
  {
    id: "m-006",
    arrivingMemberName: "Bob Smith",
    arrivingMemberEmail: "bob@example.com",
    spotOwnerName: "Eva Martinez",
    spotOwnerEmail: "eva@example.com",
    status: "completed",
    matchedAt: "2026-06-18 07:30 AM",
    arrivalAt: "2026-06-18 07:38 AM",
    spotAddress: "222 Birch St, Long Beach, CA",
  },
];

export function getAllMatches(): MatchRecord[] {
  return [...matchStore];
}

export function getMatchById(id: string): MatchRecord | undefined {
  return matchStore.find((m) => m.id === id);
}

export function getMatchesByStatus(status: MatchStatus): MatchRecord[] {
  return matchStore.filter((m) => m.status === status);
}

export function getMatchesByDateRange(
  startDate: string,
  endDate: string
): MatchRecord[] {
  return matchStore.filter((m) => {
    const matchDate = m.matchedAt.split(" ")[0];
    return matchDate >= startDate && matchDate <= endDate;
  });
}
