import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DeviceRegistrationService } from './device-registration.service';
import { DevicesController } from './devices.controller';

@Module({
  imports: [ConfigModule],
  controllers: [DevicesController],
  providers: [DeviceRegistrationService],
  exports: [DeviceRegistrationService],
})
export class DevicesModule { }