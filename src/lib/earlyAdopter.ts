export const FIRST_100_CAP = 100;

export function isEarlyAdopter(signupNumber: number): boolean {
  return signupNumber <= FIRST_100_CAP;
}

export function getTierForSignup(signupNumber: number): "free_1year" | "premium" {
  return isEarlyAdopter(signupNumber) ? "free_1year" : "premium";
}

export function getBadges(signupNumber: number): string[] {
  const badges: string[] = [];
  if (isEarlyAdopter(signupNumber)) {
    badges.push("1 Year Free");
  } else {
    badges.push("Premium Member");
  }
  return badges;
}
