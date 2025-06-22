import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async login(email: string, password: string): Promise<User> {
  console.log('Attempting login with:', email, password); // 🔍 Add this line

  const user = await this.userRepo.findOneBy({ email, password });

  console.log('Found user:', user);

  if (!user || user.role !== 'staff') {
    throw new UnauthorizedException('Invalid credentials or not a staff member');
  }

  return user;
 }
}
