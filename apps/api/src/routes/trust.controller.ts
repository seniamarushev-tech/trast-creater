import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TrustService } from '../services/trust.service';
import { AllocationInput } from '@trust/shared';
import { IsArray, IsInt, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AllocationDto implements AllocationInput {
  @IsInt()
  artistId!: number;

  @IsInt()
  tau!: number;
}

class AllocateRequestDto {
  @IsString()
  tgId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllocationDto)
  allocations!: AllocationDto[];
}

@Controller('trust')
export class TrustController {
  constructor(private readonly trustService: TrustService) {}

  @Post('allocate')
  async allocate(@Body() dto: AllocateRequestDto) {
    return this.trustService.allocate(dto.tgId, dto.allocations);
  }

  @Get('summary/:tgId')
  async summary(@Param('tgId') tgId: string) {
    return this.trustService.summary(tgId);
  }
}
