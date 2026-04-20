// seed.js — one-time demo data seeder for NutriCoach Firebase backend

async function seedDemoData() {
  const logEl = document.getElementById('seed-log');
  const btn   = document.getElementById('seed-btn');
  btn.disabled = true;

  function log(msg, isError) {
    console.log(msg);
    const line = document.createElement('div');
    line.style.color = isError ? '#e53e3e' : 'inherit';
    line.textContent = msg;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  // Creates a Firebase Auth user via a secondary app instance so the main
  // app's auth state isn't disrupted. Returns the new user's UID.
  // If the email already exists, signs in to retrieve the UID instead.
  let secondaryApp;
  try {
    secondaryApp = firebase.app('seed');
  } catch {
    secondaryApp = firebase.initializeApp(firebaseConfig, 'seed');
  }
  const secondaryAuth = secondaryApp.auth();

  async function createAuthUser(email, password) {
    try {
      const cred = await secondaryAuth.createUserWithEmailAndPassword(email, password);
      await secondaryAuth.signOut();
      return cred.user.uid;
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        const cred = await secondaryAuth.signInWithEmailAndPassword(email, password);
        await secondaryAuth.signOut();
        return cred.user.uid;
      }
      throw e;
    }
  }

  try {
    log('Creating Firebase Auth users…');
    const u1 = await createAuthUser('sarah@nutricoach.com', 'password123');
    log('  ✓ Sarah Johnson (nutritionist)');
    const u2 = await createAuthUser('mike@nutricoach.com', 'password123');
    log('  ✓ Mike Chen (nutritionist)');
    const u3 = await createAuthUser('alice@email.com', 'password123');
    log('  ✓ Alice Brown (client)');
    const u4 = await createAuthUser('bob@email.com', 'password123');
    log('  ✓ Bob Smith (client)');
    const u5 = await createAuthUser('carol@email.com', 'password123');
    log('  ✓ Carol Davis (client)');
    const u6 = await createAuthUser('david@email.com', 'password123');
    log('  ✓ David Wilson (client)');

    // Sign in as Sarah so we have write access for Firestore
    log('Signing in to write Firestore data…');
    await auth.signInWithEmailAndPassword('sarah@nutricoach.com', 'password123');

    log('Writing user profiles…');
    const usersBatch = db.batch();
    usersBatch.set(db.collection('users').doc(u1), { name: 'Sarah Johnson', email: 'sarah@nutricoach.com', role: 'nutritionist' });
    usersBatch.set(db.collection('users').doc(u2), { name: 'Mike Chen',     email: 'mike@nutricoach.com',  role: 'nutritionist' });
    usersBatch.set(db.collection('users').doc(u3), { name: 'Alice Brown',   email: 'alice@email.com',      role: 'client' });
    usersBatch.set(db.collection('users').doc(u4), { name: 'Bob Smith',     email: 'bob@email.com',        role: 'client' });
    usersBatch.set(db.collection('users').doc(u5), { name: 'Carol Davis',   email: 'carol@email.com',      role: 'client' });
    usersBatch.set(db.collection('users').doc(u6), { name: 'David Wilson',  email: 'david@email.com',      role: 'client' });
    await usersBatch.commit();

    log('Creating client profiles…');
    const c1Ref = db.collection('clients').doc();
    const c2Ref = db.collection('clients').doc();
    const c3Ref = db.collection('clients').doc();
    const c4Ref = db.collection('clients').doc();
    const c1 = c1Ref.id, c2 = c2Ref.id, c3 = c3Ref.id, c4 = c4Ref.id;

    const clientsBatch = db.batch();
    clientsBatch.set(c1Ref, { userId: u3, nutritionistId: u1, name: 'Alice Brown',  age: 29, height: '165 cm', goal: 'Weight loss & improve energy',          allergies: 'Lactose intolerant', notes: 'Prefers plant-based meals when possible.', currentWeight: 72.4 });
    clientsBatch.set(c2Ref, { userId: u4, nutritionistId: u1, name: 'Bob Smith',    age: 35, height: '178 cm', goal: 'Muscle gain & performance',              allergies: 'None',              notes: 'Trains 5x per week. High protein focus.',    currentWeight: 85.0 });
    clientsBatch.set(c3Ref, { userId: u5, nutritionistId: u2, name: 'Carol Davis',  age: 42, height: '162 cm', goal: 'Manage cholesterol & weight maintenance', allergies: 'Tree nuts',         notes: 'Busy schedule — needs quick meal options.',  currentWeight: 68.2 });
    clientsBatch.set(c4Ref, { userId: u6, nutritionistId: u2, name: 'David Wilson', age: 24, height: '180 cm', goal: 'Bulk up for sport season',               allergies: 'Shellfish',         notes: 'Plays rugby. Needs calorie-dense meals.',    currentWeight: 78.5 });
    await clientsBatch.commit();

    log('Creating meal plans…');
    const plansBatch = db.batch();
    plansBatch.set(db.collection('mealPlans').doc(), {
      clientId: c1, dateCreated: '2026-04-10',
      meals: [
        { type: 'breakfast', items: ['Oat porridge with banana', 'Black coffee'] },
        { type: 'lunch',     items: ['Grilled chicken salad', 'Whole grain bread', 'Water'] },
        { type: 'dinner',    items: ['Salmon fillet', 'Steamed broccoli', 'Brown rice'] },
        { type: 'snacks',    items: ['Apple', 'Handful of almonds'] }
      ],
      notes: 'Aim for 1800 kcal/day. Keep sodium low.'
    });
    plansBatch.set(db.collection('mealPlans').doc(), {
      clientId: c2, dateCreated: '2026-04-12',
      meals: [
        { type: 'breakfast', items: ['6 egg whites scrambled', 'Whole grain toast', 'Orange juice'] },
        { type: 'lunch',     items: ['Turkey & avocado wrap', 'Greek yogurt'] },
        { type: 'dinner',    items: ['Beef stir-fry with vegetables', 'Jasmine rice'] },
        { type: 'snacks',    items: ['Protein shake', 'Banana', 'Cottage cheese'] }
      ],
      notes: 'Target 2800 kcal, 200g protein. Pre-workout snack 45 min before training.'
    });
    plansBatch.set(db.collection('mealPlans').doc(), {
      clientId: c3, dateCreated: '2026-04-08',
      meals: [
        { type: 'breakfast', items: ['Overnight oats', 'Blueberries', 'Green tea'] },
        { type: 'lunch',     items: ['Lentil soup', 'Whole grain crackers'] },
        { type: 'dinner',    items: ['Grilled chicken breast', 'Roasted sweet potato', 'Side salad'] },
        { type: 'snacks',    items: ['Carrot sticks with hummus'] }
      ],
      notes: 'Low saturated fat. Avoid processed foods. 1600 kcal target.'
    });
    plansBatch.set(db.collection('mealPlans').doc(), {
      clientId: c4, dateCreated: '2026-04-14',
      meals: [
        { type: 'breakfast', items: ['4 scrambled eggs', 'Whole milk', 'Peanut butter toast x2'] },
        { type: 'lunch',     items: ['Double chicken burrito', 'Brown rice', 'Beans'] },
        { type: 'dinner',    items: ['Beef burger patties x2', 'Sweet potato fries', 'Mixed veg'] },
        { type: 'snacks',    items: ['Mass gainer shake', 'Mixed nuts', 'Cheese & crackers'] }
      ],
      notes: '3500+ kcal. Eat every 3 hours. Hydrate well on match days.'
    });
    await plansBatch.commit();

    log('Creating check-ins…');
    const ciList = [
      { clientId: c1, date: '2026-04-16', adherence: 9, hunger: 4, energy: 8, weight: 72.8, bodyFat: null, muscleMass: null, comments: 'Great day, felt energised.' },
      { clientId: c1, date: '2026-04-17', adherence: 6, hunger: 7, energy: 5, weight: 72.6, bodyFat: null, muscleMass: null, comments: 'Had a work lunch off-plan.' },
      { clientId: c1, date: '2026-04-18', adherence: 8, hunger: 5, energy: 7, weight: 72.4, bodyFat: null, muscleMass: null, comments: 'Felt good overall, skipped afternoon snack.' },
      { clientId: c1, date: '2026-04-19', adherence: 7, hunger: 6, energy: 7, weight: 72.3, bodyFat: null, muscleMass: null, comments: '' },
      { clientId: c2, date: '2026-04-17', adherence: 8, hunger: 5, energy: 8, weight: 85.2, bodyFat: null, muscleMass: null, comments: 'Missed protein shake in the morning.' },
      { clientId: c2, date: '2026-04-18', adherence: 10, hunger: 6, energy: 9, weight: 85.0, bodyFat: null, muscleMass: null, comments: 'Hit all macros. Strong session at the gym.' },
      { clientId: c3, date: '2026-04-18', adherence: 7, hunger: 6, energy: 6, weight: 68.2, bodyFat: null, muscleMass: null, comments: 'Busy day, had to grab food on the go.' },
      { clientId: c4, date: '2026-04-18', adherence: 9, hunger: 7, energy: 9, weight: 78.5, bodyFat: null, muscleMass: null, comments: 'Match day — ate well, performed great.' },
    ];
    for (const ci of ciList) {
      await db.collection('checkIns').add(ci);
    }

    log('Creating measurements…');
    const mList = [
      { clientId: c1, date: '2026-04-16', bodyFat: 28.7, muscleMass: 46.9 },
      { clientId: c1, date: '2026-04-17', bodyFat: 28.5, muscleMass: 47.0 },
      { clientId: c1, date: '2026-04-18', bodyFat: 28.2, muscleMass: 47.1 },
      { clientId: c1, date: '2026-04-19', bodyFat: 28.0, muscleMass: 47.2 },
      { clientId: c2, date: '2026-04-17', bodyFat: 14.5, muscleMass: 67.8 },
      { clientId: c2, date: '2026-04-18', bodyFat: 14.2, muscleMass: 68.1 },
    ];
    for (const m of mList) {
      await db.collection('measurements').doc(`${m.clientId}_${m.date}`).set(m);
    }

    log('Creating meal plan templates…');
    const tplBatch = db.batch();
    tplBatch.set(db.collection('mealPlanTemplates').doc(), {
      name: 'Weight Loss Starter', description: 'Low calorie, high protein — 1600–1800 kcal', createdBy: u1,
      meals: [
        { type: 'breakfast', items: ['Overnight oats with berries', 'Green tea'] },
        { type: 'lunch',     items: ['Grilled chicken salad', 'Whole grain bread'] },
        { type: 'dinner',    items: ['Baked salmon', 'Steamed broccoli', 'Quinoa'] },
        { type: 'snacks',    items: ['Apple', 'Handful of almonds'] }
      ],
      notes: '1600–1800 kcal/day. High protein, low saturated fat.'
    });
    tplBatch.set(db.collection('mealPlanTemplates').doc(), {
      name: 'Muscle Gain — High Protein', description: 'Calorie surplus for muscle building — 2800+ kcal', createdBy: u1,
      meals: [
        { type: 'breakfast', items: ['6 egg whites scrambled', 'Whole grain toast x2', 'Banana'] },
        { type: 'lunch',     items: ['Chicken breast 200g', 'Brown rice', 'Mixed veg'] },
        { type: 'dinner',    items: ['Beef mince stir-fry', 'Jasmine rice', 'Spinach'] },
        { type: 'snacks',    items: ['Protein shake', 'Cottage cheese', 'Rice cakes with peanut butter'] }
      ],
      notes: '2800–3000 kcal. 180–200g protein target. Eat every 3–4 hours.'
    });
    tplBatch.set(db.collection('mealPlanTemplates').doc(), {
      name: 'Heart-Healthy Maintenance', description: 'Low saturated fat, Mediterranean-style', createdBy: u2,
      meals: [
        { type: 'breakfast', items: ['Porridge with flaxseed', 'Blueberries', 'Black coffee'] },
        { type: 'lunch',     items: ['Lentil & vegetable soup', 'Whole grain crackers'] },
        { type: 'dinner',    items: ['Grilled trout', 'Roasted sweet potato', 'Side salad with olive oil'] },
        { type: 'snacks',    items: ['Walnuts', 'Orange'] }
      ],
      notes: 'Focus on omega-3 rich foods. Avoid processed meats and excess salt.'
    });
    await tplBatch.commit();

    log('');
    log('✅ Seeding complete! All demo data is in Firebase.');
    log('You can now sign in at /app/index.html');
    log('  Nutritionist: sarah@nutricoach.com / password123');
    log('  Client:       alice@email.com / password123');

  } catch (err) {
    log('❌ Error: ' + err.message, true);
    console.error(err);
  } finally {
    btn.disabled = false;
  }
}
