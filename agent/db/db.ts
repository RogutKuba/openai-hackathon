import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL!;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export const db = drizzle(postgres(DATABASE_URL));

export const takeUniqueOrThrow = <T extends any[]>(values: T): T[number] => {
  if (values.length !== 1)
    throw new Error('Found non unique or inexistent entity value');
  return values[0]!;
};

export const takeUnique = <T extends any[]>(values: T): T[number] | null => {
  if (values.length !== 1) return null;
  return values[0]!;
};

export const takeFirst = <T extends any[]>(values: T): T[number] | null => {
  if (values.length === 0) return null;
  return values[0]!;
};
