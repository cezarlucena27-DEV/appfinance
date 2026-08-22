import { Controller, Get, Post, Patch, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Roles('master')
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.usersService.findAllByWorkspace(user.workspaceId);
  }

  @Roles('master')
  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.usersService.getWorkspaceStats(user.workspaceId);
  }

  @Roles('master')
  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string, @Body() body: { message?: string }, @CurrentUser() user: any) {
    return this.usersService.toggleActive(id, user.workspaceId, body?.message);
  }

  @Roles('master')
  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body('role') role: string, @CurrentUser() user: any) {
    return this.usersService.updateRole(id, user.workspaceId, role);
  }

  @Roles('master')
  @Put(':id')
  updateUser(@Param('id') id: string, @Body() body: { name?: string; email?: string }, @CurrentUser() user: any) {
    return this.usersService.updateUser(id, user.workspaceId, body);
  }

  @Roles('master')
  @Post(':id/reset-password')
  resetPassword(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.resetPassword(id, user.workspaceId);
  }

  @Roles('master')
  @Delete(':id')
  deleteUser(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.deleteUser(id, user.workspaceId);
  }

  @Roles('master')
  @Post('invite')
  inviteUser(@Body() body: { email: string; name: string }, @CurrentUser() user: any) {
    return this.usersService.inviteUser(user.workspaceId, body.email, body.name, user.id);
  }

  @Roles('master')
  @Patch('workspace/plan')
  updatePlan(@Body('plan') plan: string, @CurrentUser() user: any) {
    return this.usersService.updateWorkspacePlan(user.workspaceId, plan);
  }
}
