import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    isSuperAdmin?: boolean;
  }) {
    if (!data.username || !data.email || !data.password || !data.fullName) {
      throw new BadRequestException('البيانات الأساسية مطلوبة');
    }

    const exists = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: data.username }, { email: data.email }],
      },
    });

    if (exists) {
      throw new BadRequestException('اسم المستخدم أو البريد مستخدم سابقًا');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        phone: data.phone,
        isSuperAdmin: data.isSuperAdmin ?? false,
      },
    });
  }

  async assignRole(userId: string, roleId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('الدور غير موجود');
    }

    return this.prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
      update: {},
      create: {
        userId,
        roleId,
      },
    });
  }
}
