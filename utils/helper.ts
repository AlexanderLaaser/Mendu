export function getOppositeRoleName(
  currentRole: "Talent" | "Insider" | undefined
) {
  return currentRole === "Talent" ? "Insider" : "Talents";
}
