import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesService } from './roles.service';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Roles('super_admin', 'admin')
  @UseGuards(RolesGuard)
  findAll() {
    return this.rolesService.findAll();
  }

  @Post()
  @Roles('super_admin')
  @UseGuards(RolesGuard)
  create(@Body() body: { name: string; description?: string }) {
    return this.rolesService.create(body.name, body.description);
  }

  @Post(':roleId/permissions/:permissionId')
  @Roles('super_admin')
  @UseGuards(RolesGuard)
  assignPermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.rolesService.assignPermission(roleId, permissionId);
  }
}
