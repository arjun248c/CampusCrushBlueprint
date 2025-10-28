import { db } from "./db";
import { colleges } from "@shared/schema";
import { eq } from "drizzle-orm";

const collegesData = [
  { name: "Stanford University", emailDomain: "stanford.edu" },
  { name: "Harvard University", emailDomain: "harvard.edu" },
  { name: "MIT", emailDomain: "mit.edu" },
  { name: "UC Berkeley", emailDomain: "berkeley.edu" },
  { name: "Yale University", emailDomain: "yale.edu" },
  { name: "Princeton University", emailDomain: "princeton.edu" },
  { name: "Columbia University", emailDomain: "columbia.edu" },
  { name: "University of Pennsylvania", emailDomain: "upenn.edu" },
  { name: "Cornell University", emailDomain: "cornell.edu" },
  { name: "Brown University", emailDomain: "brown.edu" },
  { name: "Duke University", emailDomain: "duke.edu" },
  { name: "Northwestern University", emailDomain: "northwestern.edu" },
  { name: "UCLA", emailDomain: "ucla.edu" },
  { name: "USC", emailDomain: "usc.edu" },
  { name: "NYU", emailDomain: "nyu.edu" },
];

async function seed() {
  console.log("Seeding colleges...");

  for (const college of collegesData) {
    try {
      // Check if college already exists
      const existing = await db
        .select()
        .from(colleges)
        .where(eq(colleges.emailDomain, college.emailDomain))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(colleges).values(college);
        console.log(`✓ Added ${college.name}`);
      } else {
        console.log(`- ${college.name} already exists`);
      }
    } catch (error) {
      console.error(`✗ Error adding ${college.name}:`, error);
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
