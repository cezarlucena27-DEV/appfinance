import { Controller, Get, UseGuards } from '@nestjs/common';
import { SegmentsService } from './segments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('segments')
export class SegmentsController {
  constructor(private segmentsService: SegmentsService) {}

  @Get()
  findAll() {
    return this.segmentsService.findAll();
  }
}
