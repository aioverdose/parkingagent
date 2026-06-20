export const FIRST_100_CAP = 100;

export function isEarlyAdopter(signupNumber: number): boolean {
  return signupNumber <= FIRST_100_CAP;
}

export function getTierForSignup(signupNumber: number): "free" | "premium_pending" {
  return isEarlyAdopter(signupNumber) ? "free" : "premium_pending";
}

export function getBadges(signupNumber: number): string[] {
  const badges: string[] = [];
  if (isEarlyAdopter(signupNumber)) {
    badges.push("Early Adopter");
  }
  return badges;
}
