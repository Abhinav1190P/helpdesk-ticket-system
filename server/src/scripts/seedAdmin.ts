/**
 * Creates (or promotes) the initial admin account.
 * Usage: npm run seed:admin   (reads ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD from .env)
 */
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { env } from '../config/env';
import { User } from '../models/User';

async function run() {
  const name = process.env.ADMIN_NAME ?? 'Admin';
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set');

  await connectDB(env.mongoUri);
  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = 'admin';
    await existing.save();
    console.log(`Promoted existing user ${email} to admin`);
  } else {
    await User.create({ name, email, password, role: 'admin' });
    console.log(`Created admin ${email}`);
  }
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
