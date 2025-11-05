import bcrypt from 'bcrypt';
import { UserModel, CreateUserData } from '../models/User';
import { generateToken } from '../utils/jwt';

export class AuthService {
  static async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) {
    // Check if user exists
    const existingUser = await UserModel.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const password_hash = await bcrypt.hash(data.password, 10);

    // Create user
    const userData: CreateUserData = {
      email: data.email,
      password_hash,
      first_name: data.first_name,
      last_name: data.last_name,
    };

    const user = await UserModel.create(userData);

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: 'employee', // Default role
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      token,
    };
  }

  static async login(email: string, password: string) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.is_active) {
      throw new Error('User account is inactive');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: 'employee', // Should fetch from roles table
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
      token,
    };
  }
}





