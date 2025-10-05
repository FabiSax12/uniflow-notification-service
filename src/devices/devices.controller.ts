import { Controller, Post, Delete, Body, Param } from '@nestjs/common';
import { DeviceRegistrationService } from './device-registration.service';

@Controller('devices')
export class DevicesController {
  constructor(
    private deviceRegistrationService: DeviceRegistrationService
  ) { }

  @Post('register')
  async registerDevice(
    @Body() body: { userId: string; fcmToken: string }
  ) {
    await this.deviceRegistrationService.registerDevice(
      body.userId,
      body.fcmToken
    );
    return { success: true, message: 'Device registered successfully' };
  }

  @Delete('unregister/:registrationId')
  async unregisterDevice(@Param('registrationId') registrationId: string) {
    await this.deviceRegistrationService.unregisterDevice(registrationId);
    return { success: true, message: 'Device unregistered successfully' };
  }
}