// Test login and rating flow
async function testLoginAndRating() {
  const baseUrl = 'http://localhost:5000';
  
  try {
    console.log('Testing login flow...');
    
    // Test login
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'rahul.patel@sggs.ac.in',
        password: 'test123'
      }),
      credentials: 'include'
    });
    
    console.log('Login response status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (loginResponse.ok) {
      // Test getting user
      const userResponse = await fetch(`${baseUrl}/api/auth/user`, {
        credentials: 'include'
      });
      console.log('User response status:', userResponse.status);
      const userData = await userResponse.json();
      console.log('User data:', userData);
      
      // Test getting profiles
      const profilesResponse = await fetch(`${baseUrl}/api/profiles/random`, {
        credentials: 'include'
      });
      console.log('Profiles response status:', profilesResponse.status);
      const profilesData = await profilesResponse.json();
      console.log('Profiles count:', profilesData.length);
      
      if (profilesData.length > 0) {
        // Test rating
        const targetUser = profilesData[0];
        console.log('Testing rating for user:', targetUser.id);
        
        const ratingResponse = await fetch(`${baseUrl}/api/ratings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUserId: targetUser.id,
            score: 8
          }),
          credentials: 'include'
        });
        
        console.log('Rating response status:', ratingResponse.status);
        const ratingData = await ratingResponse.json();
        console.log('Rating response:', ratingData);
      }
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testLoginAndRating();