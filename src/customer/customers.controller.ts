import { Body, Controller, Post, Res, UseGuards, Get } from '@nestjs/common';
import type { Response } from 'express';
import { CustomersService } from './customers.service';
import { CustomerInformationDto } from './dtos/CustomerInformation.dto';
import { CustomerLoginDto } from './dtos/CustomerLogin.dto';
import {
  ChangeEmailDto,
  ChangePasswordDto,
  ChangePhoneNumberDto,
} from './dtos/ChangePassword.dto';
import { OtpService } from './otp.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  SendOtpDto,
  SendOtpEmailDto,
  VerifyOtpDto,
  VerifyOtpEmailDto,
} from './dtos/Otp.dto';

@Controller('api/customers')
export class CustomersController {
  constructor(
    private customersService: CustomersService,
    private otpService: OtpService,
  ) {}

  @Post('send-email-otp')
  async sendEmailOtp(@Body() data: SendOtpEmailDto) {
    const result = await this.otpService.sendOtpToEmail(data.email);
    return { data: result };
  }

  @Post('verify-email-otp')
  async verifyEmailOtp(@Body() data: VerifyOtpEmailDto) {
    const isValid = await this.otpService.verifyEmailOtp(data.email, data.otp);
    return {
      data: {
        verified: isValid,
        message: 'Email OTP verified successfully',
      },
    };
  }

  @Post('send-phone-otp')
  async sendPhoneOtp(@Body() data: SendOtpDto) {
    const result = await this.otpService.sendOtpToPhone(data.phoneNumber);
    return { data: result };
  }

  @Post('verify-phone-otp')
  async verifyPhoneOtp(@Body() data: VerifyOtpDto) {
    const isValid = await this.otpService.verifyPhoneOtp(
      data.phoneNumber,
      data.otp,
    );
    return {
      data: {
        verified: isValid,
        message: 'Phone OTP verified successfully',
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
    const result = await this.customersService.loginCustomer(loginData);

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

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Post('change-email')
  async changeEmail(@Body() changeEmailData: ChangeEmailDto) {
    const result = await this.customersService.changeEmail(
      changeEmailData.oldEmail,
      changeEmailData.newEmail,
      changeEmailData.oldOtp,
      changeEmailData.newOtp,
    );
    return { data: result };
  }
}
