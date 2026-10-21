import { Module } from '@nestjs/common';
import { MediaModule } from '@modules/media/media.module';
import { WellnessController } from '@modules/wellness/wellness.controller';
import { WellnessService } from '@modules/wellness/wellness.service';

@Module({
  imports: [MediaModule],
  controllers: [WellnessController],
  providers: [WellnessService],
  exports: [WellnessService],
})
export class WellnessModule {}
