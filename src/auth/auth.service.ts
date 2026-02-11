import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  generateToken(payload: {
    id: string;
    email?: string;
    phoneNumber?: number;
    type: 'shop' | 'customer';
  }) {
    return this.jwtService.sign(payload);
  }

  verifyToken(token: string): Record<string, unknown> | null {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = this.jwtService.verify(token);
      return result as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}
