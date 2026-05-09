import { query } from '../db';
import { User } from '../types';

export async function findByUsername(username: string): Promise<User & { password_hash: string } | null> {
  const result = await query(
    'SELECT id, username, password_hash, ho_ten, role, email FROM users WHERE username = $1',
    [username]
  );
  console.log('findByUsername result: ', result.rows[0], 'for username: ', username);
  return result.rows[0] || null;
}

export async function findById(id: number): Promise<User | null> {
  const result = await query(
    'SELECT id, username, ho_ten, role, email FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function getAllUsers(): Promise<User[]> {
  const result = await query('SELECT id, username, ho_ten, role, email, created_at FROM users ORDER BY id');
  return result.rows;
}

export async function createUser(
  username: string,
  passwordHash: string,
  hoTen: string,
  role: 'nhan_vien' | 'quan_ly',
  email?: string
): Promise<User> {
  const result = await query(
    `INSERT INTO users (username, password_hash, ho_ten, role, email)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, username, ho_ten, role, email`,
    [username, passwordHash, hoTen, role, email]
  );
  return result.rows[0];
}
