import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { IsString } from 'class-validator';

class OnboardingDto {
  @IsString()
  tgId!: string;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('onboard')
  async onboard(@Body() dto: OnboardingDto) {
    return this.usersService.onboard(dto.tgId);
  }

  @Get('seed-info')
  async seedInfo() {
    return this.usersService.seedInfo();
  }
}
