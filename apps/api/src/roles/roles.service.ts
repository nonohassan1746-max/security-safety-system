import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('الدور غير موجود');
    }

    return role;
  }

  async create(name: string, description?: string) {
    if (!name) {
      throw new BadRequestException('اسم الدور مطلوب');
    }

    return this.prisma.role.create({
      data: {
        name,
        description,
      },
    });
  }

  async assignPermission(roleId: string, permissionId: string) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('الدور غير موجود');
    }

    const permission = await this.prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException('الصلاحية غير موجودة');
    }

    return this.prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });
  }
}
