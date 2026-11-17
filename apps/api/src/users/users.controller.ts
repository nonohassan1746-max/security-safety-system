import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create-admin')
  @Roles('super_admin')
  @UseGuards(RolesGuard)
  createAdmin(@Body() body: any) {
    return this.usersService.createUser({
      ...body,
      isSuperAdmin: true,
    });
  }

  @Post('create-manager')
  @Roles('super_admin', 'admin')
  @UseGuards(RolesGuard)
  createManager(@Body() body: any) {
    return this.usersService.createUser({
      ...body,
      isSuperAdmin: false,
    });
  }

  @Post(':userId/roles/:roleId')
  @Roles('super_admin', 'admin')
  @UseGuards(RolesGuard)
  assignRole(
    @Body() body: { userId: string; roleId: string },
  ) {
    return this.usersService.assignRole(body.userId, body.roleId);
  }
}
