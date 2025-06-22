import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.entity';
import { UserModule } from './users/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '', // your MySQL password
      database: 'pet_hostel',
      entities: [User],
      synchronize: true, // ❗ creates tables automatically
    }),
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
