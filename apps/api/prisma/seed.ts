import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const permissions = [
    { code: 'manage_users', name: 'إدارة المستخدمين' },
    { code: 'manage_roles', name: 'إدارة الأدوار' },
    { code: 'manage_employees', name: 'إدارة الموظفين' },
    { code: 'manage_shifts', name: 'إدارة الورديات' },
    { code: 'manage_attendance', name: 'إدارة الحضور والانصراف' },
    { code: 'manage_leaves', name: 'إدارة الاستئذانات' },
    { code: 'manage_violations', name: 'إدارة المخالفات' },
    { code: 'manage_incidents', name: 'إدارة البلاغات والسلامة' },
    { code: 'view_reports', name: 'عرض التقارير' },
    { code: 'view_audit_logs', name: 'عرض سجل التدقيق' },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: {},
      create: permission,
    });
  }

  const roles = [
    { name: 'super_admin', description: 'مدير المنظومة الأساسي', isSystem: true },
    { name: 'admin', description: 'مدير', isSystem: false },
    { name: 'supervisor', description: 'مشرف', isSystem: false },
    { name: 'hr', description: 'الموارد البشرية', isSystem: false },
    { name: 'safety_officer', description: 'مسؤول السلامة', isSystem: false },
    { name: 'employee', description: 'موظف', isSystem: false },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  const superRole = await prisma.role.findUnique({ where: { name: 'super_admin' } });
  const allPermissions = await prisma.permission.findMany();

  if (superRole) {
    for (const permission of allPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: superRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  const username = process.env.ADMIN_USERNAME || 'hassan';
  const email = process.env.ADMIN_EMAIL || 'hassan@system.com';
  const password = process.env.ADMIN_PASSWORD || 'StrongPass!123';

  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (!existingUser) {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        fullName: 'حسن محرزي',
        phone: '0000000000',
        isSuperAdmin: true,
      },
    });

    if (superRole) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: superRole.id,
          assignedAt: new Date(),
        },
      });
    }

    console.log('Super admin created successfully.');
    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('IMPORTANT: change the password after first login.');
  } else {
    console.log('Super admin account already exists.');
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
