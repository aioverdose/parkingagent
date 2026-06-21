import "dotenv/config";
import { db } from "./index";

async function addCourseContentColumn() {
  await db.execute(`
    ALTER TABLE course_modules ADD COLUMN IF NOT EXISTS content TEXT;
  `);

  await db.execute(`
    UPDATE course_modules SET content = 'In Long Beach, street parking is regulated by the city municipal code. Key rules:
• 2-hour time limits apply in most residential areas (look for white signs)
• Permit zones require a residential permit — visitors must use guest permits
• No-parking zones include: red curbs (fire hydrants), yellow curbs (loading), blue curbs (disabled)
• Street sweeping happens 1x per week per block — check the posted schedule
• Parking within 15 feet of a fire hydrant is illegal at all times
• Vehicles must be moved every 72 hours on public streets (abandoned vehicle ordinance)
• Overnight parking restrictions vary by neighborhood — look for posted signs' WHERE id = 'cm1';
  `);

  await db.execute(`
    UPDATE course_modules SET content = 'As a Spotimization member, you agree to:
• Only offer spots you are actively vacating (no advance reservations)
• Arrive within the 10-minute window after being matched
• Keep your ranking score accurate by completing matches
• Never sell or trade spots outside the platform
• Report no-shows and failed matches promptly
• Maintain good-standing status by completing all courses
• Treat all members with respect — harassment = permanent ban
• Do not game the system (e.g., fake offers or matches)' WHERE id = 'cm2';
  `);

  await db.execute(`
    UPDATE course_modules SET content = 'Your ranking score determines your priority in the AI matching queue.
Scoring:
• +10 points per successful match (you vacate, they arrive)
• +5 points for accepting a match promptly
• +20 points for completing all course modules
• -15 points for no-show (you offered but left before match arrived)
• -25 points for failed match (you didn''t arrive after accepting)
• -50 points for suspended status (after 3 violations)

Maintaining Good-Standing:
• Score above 40 = Good Standing (top priority)
• Score 20-40 = Warning (reduced priority)
• Score below 20 = Suspended (no matching until courses re-taken)

Scores reset quarterly to give new members a fair chance.' WHERE id = 'cm3';
  `);

  console.log("course_modules.content column added and seeded");
}

addCourseContentColumn().catch((e) => {
  console.error(e);
  process.exit(1);
});
