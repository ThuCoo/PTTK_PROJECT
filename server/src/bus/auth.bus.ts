import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as UserDAO from '../dao/user.dao';
import { User, JwtPayload } from '../types';

const SALT_ROUNDS = 10;
const JWT_EXPIRES = '24h';

export async function login(username: string, password: string): Promise<{ token: string; user: User }> {
  const userRow = await UserDAO.findByUsername(username);

  if (!userRow) {
    throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
  }
    

  const valid = await bcrypt.compare(password, userRow.password_hash);
  console.log('tpod ang nhap roi ' ,password, '-',userRow.password_hash);
  if (!valid) {
    throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
  }

  const payload: JwtPayload = {
    userId: userRow.id,
    username: userRow.username,
    role: userRow.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: JWT_EXPIRES });

  const user: User = {
    id: userRow.id,
    username: userRow.username,
    ho_ten: userRow.ho_ten,
    role: userRow.role,
    email: userRow.email,
  };

  return { token, user };
}

export async function createUser(
  username: string,
  password: string,
  hoTen: string,
  role: 'nhan_vien' | 'quan_ly',
  email?: string
): Promise<User> {
  const existing = await UserDAO.findByUsername(username);
  if (existing) {
    throw new Error('Tên đăng nhập đã tồn tại');
  }
  if (password.length < 6) {
    throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  return UserDAO.createUser(username, passwordHash, hoTen, role, email);
}

export async function getMe(userId: number): Promise<User | null> {
  return UserDAO.findById(userId);
}

export async function getAllUsers(): Promise<User[]> {
  return UserDAO.getAllUsers();
}
