import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CustomersService } from './customers.service';
import { CustomerInformationDto } from './dtos/CustomerInformation.dto';
import { CustomerLoginDto } from './dtos/CustomerLogin.dto';
import {
  ChangePasswordDto,
  ChangePhoneNumberDto,
} from './dtos/ChangePassword.dto';
import { OtpService } from './otp.service';
import { SendOtpDto, VerifyOtpDto } from './dtos/Otp.dto';

@Controller('api/customers')
export class CustomersController {
  constructor(
    private customersService: CustomersService,
    private otpService: OtpService,
  ) {}

  @Post('send-otp')
  async sendOtp(@Body() data: SendOtpDto) {
    const result = await this.otpService.sendOtp(data.phoneNumber);
    return { data: result };
  }

  @Post('verify-otp')
  async verifyOtp(@Body() data: VerifyOtpDto) {
    const isValid = await this.otpService.verifyOtp(data.phoneNumber, data.otp);
    return {
      data: {
        verified: isValid,
        message: 'OTP verified successfully',
      },
    };
  }

  @Post('register')
  async registerCustomer(
    @Body() userData: CustomerInformationDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.customersService.registerCustomer(userData);

    // Set token in HTTP-only cookie
    res.cookie('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      data: {
        customer: result.customer,
        token: result.token,
      },
    };
  }

  @Post('login')
  async loginCustomer(
    @Body() loginData: CustomerLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.customersService.loginCustomer(
      loginData.phoneNumber,

      loginData.otp,
      loginData.password,
    );

    // Set token in HTTP-only cookie
    res.cookie('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      data: {
        customer: result.customer,
        token: result.token,
      },
    };
  }

  @Post('change-password')
  async changePassword(@Body() changePasswordData: ChangePasswordDto) {
    const result = await this.customersService.changePassword(
      changePasswordData.phoneNumber,
      changePasswordData.oldPassword,
      changePasswordData.newPassword,
      changePasswordData.otp,
    );
    return { data: result };
  }

  @Post('change-phone-number')
  async changePhoneNumber(@Body() changePhoneNumberData: ChangePhoneNumberDto) {
    const result = await this.customersService.changePhoneNumber(
      changePhoneNumberData.oldPhoneNumber,
      changePhoneNumberData.newPhoneNumber,
      changePhoneNumberData.oldOtp,
      changePhoneNumberData.newOtp,
    );
    return { data: result };
  }
}
