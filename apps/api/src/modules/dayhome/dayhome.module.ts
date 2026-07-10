import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DayhomeController } from './dayhome.controller';
import { InternalCallbackController } from './internal-callback.controller';
import { DayhomeService } from './dayhome.service';
import { DayhomeRepository } from './dayhome.repository';
import { Dayhome } from './entities/dayhome.entity';
import { IntakeLog } from './entities/intake-log.entity';
import { Document } from './entities/document.entity';
import { StorageModule } from '../../storage/storage.module';
import { UsersModule } from '../../users/users.module';
import { CallbacksModule } from '../callbacks/callbacks.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Dayhome, IntakeLog, Document]),
    UsersModule,
    StorageModule,
    CallbacksModule,
  ],
  controllers: [DayhomeController, InternalCallbackController],
  providers: [DayhomeService, DayhomeRepository],
  exports: [DayhomeService],
})
export class DayhomeModule {}
