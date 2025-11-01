import 'dotenv/config';
import { db } from './db';
import { colleges } from '../shared/schema';

async function seedDatabase() {
  console.log('Seeding database...');

  try {
    // Insert SGGS college only
    const sampleColleges = [
      {
        name: 'Shri Guru Gobind Singh Ji Institute of Engineering and Technology, Vishnupuri, Nanded-431606',
        emailDomain: 'sggs.ac.in',
        isActive: true,
      }
    ];

    // Clear existing colleges and insert only SGGS
    await db.delete(colleges);
    await db.insert(colleges).values(sampleColleges);
    console.log('✅ SGGS college configured successfully');

    console.log('Database seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0));
}

export { seedDatabase };