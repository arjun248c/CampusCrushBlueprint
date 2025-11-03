import 'dotenv/config';
import { db } from './server/db';
import { users, colleges } from './shared/schema';
import { eq } from 'drizzle-orm';

async function addTestUsers() {
  try {
    console.log('Adding test users...');

    // First, ensure we have a college
    const [college] = await db.insert(colleges).values({
      name: 'SGGS Institute of Engineering and Technology',
      emailDomain: 'sggs.ac.in',
      isActive: true
    }).onConflictDoNothing().returning();

    let collegeId = college?.id;
    
    // If college already exists, get it
    if (!collegeId) {
      const [existingCollege] = await db.select().from(colleges).where(eq(colleges.emailDomain, 'sggs.ac.in'));
      collegeId = existingCollege?.id;
    }

    if (!collegeId) {
      throw new Error('Could not create or find college');
    }

    // Test users data
    const testUsers = [
      {
        email: 'arjun.male@sggs.ac.in',
        firstName: 'Arjun',
        lastName: 'Sharma',
        displayName: 'Arjun S',
        gender: 'male',
        bio: 'Computer Science student, loves coding and gaming',
        collegeId,
        verificationStatus: 'verified'
      },
      {
        email: 'priya.female@sggs.ac.in',
        firstName: 'Priya',
        lastName: 'Patel',
        displayName: 'Priya P',
        gender: 'female',
        bio: 'Mechanical Engineering student, passionate about robotics',
        collegeId,
        verificationStatus: 'verified'
      },
      {
        email: 'rahul.male@sggs.ac.in',
        firstName: 'Rahul',
        lastName: 'Kumar',
        displayName: 'Rahul K',
        gender: 'male',
        bio: 'Electronics student, music enthusiast',
        collegeId,
        verificationStatus: 'verified'
      },
      {
        email: 'sneha.female@sggs.ac.in',
        firstName: 'Sneha',
        lastName: 'Singh',
        displayName: 'Sneha S',
        gender: 'female',
        bio: 'Civil Engineering student, loves photography',
        collegeId,
        verificationStatus: 'verified'
      },
      {
        email: 'amit.male@sggs.ac.in',
        firstName: 'Amit',
        lastName: 'Gupta',
        displayName: 'Amit G',
        gender: 'male',
        bio: 'IT student, blockchain enthusiast',
        collegeId,
        verificationStatus: 'verified'
      },
      {
        email: 'kavya.female@sggs.ac.in',
        firstName: 'Kavya',
        lastName: 'Reddy',
        displayName: 'Kavya R',
        gender: 'female',
        bio: 'Chemical Engineering student, loves dancing',
        collegeId,
        verificationStatus: 'verified'
      },
      {
        email: 'vikram.male@sggs.ac.in',
        firstName: 'Vikram',
        lastName: 'Joshi',
        displayName: 'Vikram J',
        gender: 'male',
        bio: 'Electrical Engineering student, sports lover',
        collegeId,
        verificationStatus: 'verified'
      },
      {
        email: 'ananya.female@sggs.ac.in',
        firstName: 'Ananya',
        lastName: 'Mehta',
        displayName: 'Ananya M',
        gender: 'female',
        bio: 'Computer Science student, AI researcher',
        collegeId,
        verificationStatus: 'verified'
      },
      {
        email: 'rohan.male@sggs.ac.in',
        firstName: 'Rohan',
        lastName: 'Verma',
        displayName: 'Rohan V',
        gender: 'male',
        bio: 'Mechanical Engineering student, car enthusiast',
        collegeId,
        verificationStatus: 'verified'
      },
      {
        email: 'ishita.female@sggs.ac.in',
        firstName: 'Ishita',
        lastName: 'Agarwal',
        displayName: 'Ishita A',
        gender: 'female',
        bio: 'Electronics student, loves reading and writing',
        collegeId,
        verificationStatus: 'verified'
      }
    ];

    // Insert users
    for (const userData of testUsers) {
      try {
        const [user] = await db.insert(users).values(userData).onConflictDoNothing().returning();
        if (user) {
          console.log(`✓ Created user: ${userData.displayName} (${userData.email})`);
        } else {
          console.log(`- User already exists: ${userData.displayName} (${userData.email})`);
        }
      } catch (error) {
        console.error(`✗ Failed to create user ${userData.displayName}:`, error.message);
      }
    }

    console.log('\n✅ Test users setup complete!');
    console.log('\nYou can now:');
    console.log('1. Login with any of the test emails (no password required in demo mode)');
    console.log('2. Test the rating system between male and female users');
    console.log('3. Check the leaderboard functionality');
    
  } catch (error) {
    console.error('❌ Error adding test users:', error);
  } finally {
    process.exit(0);
  }
}

addTestUsers();