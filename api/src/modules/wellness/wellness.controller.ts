import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { OPS_ROLES, User } from '@entities/user.entity';
import { WellnessApprovalStatus } from '@entities/wellness-meal-log.entity';
import { MediaService } from '@modules/media/media.service';
import { WellnessService } from '@modules/wellness/wellness.service';

@ApiTags('wellness')
@ApiBearerAuth()
@Controller('wellness')
export class WellnessController {
  constructor(
    private readonly wellness: WellnessService,
    private readonly media: MediaService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Müşteri wellness özeti' })
  me(@CurrentUser() user: User) {
    return this.wellness.dashboard(user.id);
  }

  @Get('water')
  water(@CurrentUser() user: User) {
    return this.wellness.waterToday(user.id);
  }

  @Post('water')
  addWater(@CurrentUser() user: User, @Body() body: { amountMl?: number }) {
    return this.wellness.addWater(user.id, body.amountMl ?? 250);
  }

  @Get('meals')
  meals(@CurrentUser() user: User) {
    return this.wellness.listMeals(user.id);
  }

  @Post('meals')
  createMeal(
    @CurrentUser() user: User,
    @Body()
    body: {
      mealType?: string;
      note?: string;
      photoUrl?: string;
      logDate?: string;
    },
  ) {
    return this.wellness.createMeal(user.id, body);
  }

  @Post('meals/photo')
  @ApiOperation({ summary: 'Müşteri: öğün fotoğrafı yükle' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  async uploadMealPhoto(@UploadedFile() file: Express.Multer.File) {
    const asset = await this.media.upload(file, 'Öğün fotoğrafı', 'wellness');
    return { url: asset.url, id: asset.id };
  }

  @Get('measurements')
  measurements(@CurrentUser() user: User) {
    return this.wellness.listMeasurements(user.id);
  }

  @Post('measurements')
  createMeasurement(
    @CurrentUser() user: User,
    @Body()
    body: {
      measuredAt?: string;
      weightKg?: number;
      waistCm?: number;
      hipCm?: number;
      note?: string;
    },
  ) {
    return this.wellness.createMeasurement(user.id, body);
  }

  @Roles(...OPS_ROLES)
  @Get('coach/kpis')
  coachKpis() {
    return this.wellness.coachKpis();
  }

  @Roles(...OPS_ROLES)
  @Get('coach/pending')
  coachPending(@Query('limit') limit?: string) {
    return this.wellness.pendingApprovals(limit ? Number(limit) : 40);
  }

  @Roles(...OPS_ROLES)
  @Get('coach/clients')
  coachClients() {
    return this.wellness.listClients();
  }

  @Roles(...OPS_ROLES)
  @Patch('coach/meals/:id')
  decideMeal(
    @Param('id') id: string,
    @Body() body: { status: 'approved' | 'rejected'; coachNote?: string },
  ) {
    const status =
      body.status === 'approved'
        ? WellnessApprovalStatus.APPROVED
        : WellnessApprovalStatus.REJECTED;
    return this.wellness.decideMeal(id, status, body.coachNote);
  }

  @Roles(...OPS_ROLES)
  @Patch('coach/measurements/:id')
  decideMeasurement(
    @Param('id') id: string,
    @Body() body: { status: 'approved' | 'rejected'; coachNote?: string },
  ) {
    const status =
      body.status === 'approved'
        ? WellnessApprovalStatus.APPROVED
        : WellnessApprovalStatus.REJECTED;
    return this.wellness.decideMeasurement(id, status, body.coachNote);
  }

  @Roles(...OPS_ROLES)
  @Post('coach/whatsapp-blast')
  blast(
    @CurrentUser() user: User,
    @Body()
    body: {
      templateName: string;
      languageCode?: string;
      bodyParams?: string[];
      message?: string;
      userIds?: string[];
    },
  ) {
    return this.wellness.createWhatsappBlast(user.id, body);
  }

  @Roles(...OPS_ROLES)
  @Get('coach/whatsapp-blasts')
  listBlasts() {
    return this.wellness.listBlasts();
  }

  @Roles(...OPS_ROLES)
  @Get('coach/whatsapp-blasts/:id')
  getBlast(@Param('id') id: string) {
    return this.wellness.getBlast(id);
  }
}
