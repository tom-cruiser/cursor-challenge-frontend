export const SAFETY_DISCLAIMER_RESPONSE =
  "Safety Disclaimer: I can only guide you through standard vaccination schedules and mild post-vaccination symptoms. If your child is severely unwell or experiencing a medical emergency, please immediately take them to your nearest verified hospital or contact emergency services.";

const EMERGENCY_KEYWORDS = [
  "severe sickness",
  "unresponsive",
  "high fever",
  "vomiting",
] as const;

const SCHEDULE_KEYWORDS = ["6 weeks", "schedule", "timeline"] as const;

export interface AIChatContext {
  childNames: string[];
  preferredHospitalName: string | null;
}

function matchesKeyword(query: string, keyword: string): boolean {
  return query.includes(keyword);
}

function matchesEmergency(query: string): boolean {
  return EMERGENCY_KEYWORDS.some((keyword) => matchesKeyword(query, keyword));
}

function matchesSchedule(query: string): boolean {
  return SCHEDULE_KEYWORDS.some((keyword) => matchesKeyword(query, keyword));
}

function buildScheduleResponse(context: AIChatContext): string {
  const personalization =
    context.childNames.length > 0
      ? `Review the Timeline for ${context.childNames.join(" and ")} to confirm exact due dates from your hospital's schedule.`
      : "Add a child profile and select a preferred hospital to see personalized due dates on your Timeline.";

  return [
    "Standard early infant immunizations typically include:",
    "",
    "• **BCG** — given at birth or shortly after, protects against tuberculosis",
    "• **Polio (OPV/IPV)** — oral or inactivated polio vaccine series starting early infancy",
    "• **Pentavalent (Penta)** — combined DTP-HepB-Hib vaccine, often due around 6 weeks",
    "",
    "At **6 weeks**, many facilities also administer **PCV** and **Rotavirus** vaccines depending on local guidelines.",
    "",
    personalization,
  ].join("\n");
}

function buildMildFeverResponse(): string {
  return [
    "A **mild fever** (37.5–38.5°C) after vaccination is common and usually resolves within 24–48 hours.",
    "",
    "**What you can do:**",
    "• Offer extra fluids and breast milk or formula",
    "• Dress your child in light clothing",
    "• Use paracetamol only if advised by your clinician (follow weight-based dosing)",
    "",
    "**Seek care urgently if:** fever persists beyond 48 hours, exceeds 39°C, or is accompanied by lethargy, rash, or breathing difficulty.",
  ].join("\n");
}

function buildHospitalResponse(context: AIChatContext): string {
  if (context.preferredHospitalName) {
    return [
      `Your preferred health center is **${context.preferredHospitalName}**.`,
      "",
      "Open **Nearby Hospitals** to view directions, contact details, and update your preferred facility for each child.",
    ].join("\n");
  }

  return [
    "You haven't selected a preferred health center yet.",
    "",
    "Go to **Nearby Hospitals** to browse registered facilities, compare distances, and set a preferred hospital — this unlocks your child's personalized vaccine schedule.",
  ].join("\n");
}

function buildDefaultResponse(): string {
  return [
    "I'm here to help with vaccination schedules, post-vaccine care, and finding health centers.",
    "",
    "Try one of the suggested prompts above, or ask a specific question about your child's immunization journey.",
  ].join("\n");
}

export function resolveMockAssistantReply(
  query: string,
  context: AIChatContext,
): string {
  const normalized = query.trim().toLowerCase();

  if (matchesEmergency(normalized)) {
    return SAFETY_DISCLAIMER_RESPONSE;
  }

  if (matchesSchedule(normalized)) {
    return buildScheduleResponse(context);
  }

  if (
    (normalized.includes("fever") || normalized.includes("mild")) &&
    !normalized.includes("high fever")
  ) {
    return buildMildFeverResponse();
  }

  if (
    normalized.includes("nearest") ||
    normalized.includes("health center") ||
    normalized.includes("hospital") ||
    normalized.includes("preferred")
  ) {
    return buildHospitalResponse(context);
  }

  return buildDefaultResponse();
}
