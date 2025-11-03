import 'dotenv/config';
import { db } from './server/db';
import { users, ratings } from './shared/schema';
import { eq } from 'drizzle-orm';

async function testRating() {
  try {
    console.log('Testing rating system...');

    // Get two test users
    const allUsers = await db.select().from(users).limit(5);
    console.log('Available users:', allUsers.map(u => ({ id: u.id, email: u.email, gender: u.gender, collegeId: u.collegeId })));

    // Find a male and female user
    const maleUser = allUsers.find(u => u.gender === 'male');
    const femaleUser = allUsers.find(u => u.gender === 'female');

    if (!maleUser || !femaleUser) {
      console.log('Need both male and female users for testing');
      return;
    }

    console.log('Test users:', {
      male: { id: maleUser.id, email: maleUser.email },
      female: { id: femaleUser.id, email: femaleUser.email }
    });

    // Check existing ratings
    const existingRatings = await db.select().from(ratings);
    console.log('Existing ratings count:', existingRatings.length);

    console.log('Rating system test complete');
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    process.exit(0);
  }
}

testRating();