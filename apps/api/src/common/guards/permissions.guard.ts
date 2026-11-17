import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const subject = request.user;

    if (!subject) {
      throw new ForbiddenException('لا يوجد مستخدم مصادق');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: subject.sub },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new ForbiddenException('المستخدم غير موجود');
    }

    const permissions = new Set(
      user.userRoles.flatMap((roleAssignment) =>
        roleAssignment.role.permissions.map(
          (rolePermission) => rolePermission.permission.code,
        ),
      ),
    );

    const canAccess = requiredPermissions.every((permission) =>
      permissions.has(permission),
    );

    if (!canAccess) {
      throw new ForbiddenException('ليس لديك صلاحية لتنفيذ هذه العملية');
    }

    return true;
  }
}
