/**
 * Seeds a few demo users and tickets so the app has data to explore.
 * Usage: npm run seed:demo   (safe to re-run — skips users that already exist)
 * Demo users log in with password: Password123
 */
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { env } from '../config/env';
import { User } from '../models/User';
import { Ticket } from '../models/Ticket';

const demo = [
  {
    user: { name: 'Priya Sharma', email: 'priya@example.com' },
    tickets: [
      { title: 'Unable to download invoice for August', description: 'Clicking Download on the billing page shows a spinner forever and nothing downloads.', category: 'Billing', priority: 'High', status: 'Open' },
      { title: 'Two-factor code not arriving by SMS', description: 'I have tried three times in the last hour and no OTP has arrived on my registered number.', category: 'Account', priority: 'High', status: 'In Progress' },
      { title: 'Add dark mode to the dashboard', description: 'It would be great to have a dark theme for late-night work sessions.', category: 'Feature Request', priority: 'Low', status: 'Open' },
    ],
  },
  {
    user: { name: 'Rahul Verma', email: 'rahul@example.com' },
    tickets: [
      { title: 'App crashes when uploading large files', description: 'Uploading a PDF larger than 20 MB makes the page freeze and then crash.', category: 'Technical', priority: 'Medium', status: 'Open' },
      { title: 'How do I change my registered email?', description: 'I could not find the option in settings to update my email address.', category: 'General', priority: 'Low', status: 'Resolved' },
      { title: 'Search results not updating after filter', description: 'Filters on the reports page do not refresh the list until I reload the page.', category: 'Technical', priority: 'Medium', status: 'In Progress' },
    ],
  },
];

async function run() {
  await connectDB(env.mongoUri);
  for (const { user, tickets } of demo) {
    if (await User.exists({ email: user.email })) {
      console.log(`Skipping ${user.email} (already exists)`);
      continue;
    }
    const created = await User.create({ ...user, password: 'Password123' });
    await Ticket.insertMany(tickets.map((t) => ({ ...t, createdBy: created._id })));
    console.log(`Created ${user.email} with ${tickets.length} tickets`);
  }
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
