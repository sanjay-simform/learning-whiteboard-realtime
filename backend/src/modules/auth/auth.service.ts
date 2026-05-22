import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserService } from "../users/user.service";
import { User } from "../../db/schema/user.entity";
import { ENV } from "config/env";

export interface AuthPayload {
  userId: number;
  username: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: Partial<User>;
    token: string;
  };
}

export class AuthService {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcryptjs.genSalt(10);
    return bcryptjs.hash(password, salt);
  }

  async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcryptjs.compare(password, hashedPassword);
  }

  generateToken(payload: AuthPayload): string {
    return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: "7d" });
  }

  verifyToken(token: string): AuthPayload | null {
    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  async register(username: string, password: string): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.userService.getUserByUsername(username);
      if (existingUser) {
        return {
          success: false,
          message: "Username already registered",
        };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Create user
      const user = await this.userService.createUser({
        name: username,
        username,
        password: hashedPassword,
      });

      // Generate token
      const token = this.generateToken({
        userId: user.id,
        username: user.username,
      });

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        message: "User registered successfully",
        data: {
          user: userWithoutPassword,
          token,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: "Registration failed",
      };
    }
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await this.userService.getUserByUsername(username);
      if (!user) {
        return {
          success: false,
          message: "Invalid email or password",
        };
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        return {
          success: false,
          message: "Invalid username or password",
        };
      }

      // Generate token
      const token = this.generateToken({
        userId: user.id,
        username: user.username,
      });

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        message: "Login successful",
        data: {
          user: userWithoutPassword,
          token,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: "Login failed",
      };
    }
  }
}
