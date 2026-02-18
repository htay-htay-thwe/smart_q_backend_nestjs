import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { ShopsService } from './shops.service';
import { ShopInformationDto } from './dtos/ShopInformation.dto';
import { LoginDto } from './dtos/Login.dto';
import { OtpService } from '../customer/otp.service';
import {
  SendEmailOtpDto,
  SendPhoneOtpDto,
  VerifyEmailOtpDto,
  VerifyPhoneOtpDto,
} from './dtos/ShopOtp.dto';
import {
  ChangeShopPasswordDto,
  ChangeShopEmailDto,
  ChangeShopPhoneDto,
} from './dtos/ChangeShop.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/shops')
export class ShopsController {
  constructor(
    private shopsService: ShopsService,
    private otpService: OtpService,
  ) {}

  @Post('register')
  @UsePipes(new ValidationPipe())
  async registerShopPartner(
    @Body() shopData: ShopInformationDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('Received shop registration data:', shopData);
    const result = await this.shopsService.registerShopPartner(shopData);

    // Set token in HTTP-only cookie
    res.cookie('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      data: {
        shop: result.shop,
        token: result.token,
      },
    };
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  async loginShopPartner(
    @Body() loginData: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('Received shop login data:', loginData);
    const result = await this.shopsService.loginShopPartner(loginData);

    // Set token in HTTP-only cookie
    res.cookie('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      data: {
        shop: result.shop,
        token: result.token,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return { data: await this.shopsService.findAll() };
  }

  @Post('send-email-otp')
  async sendEmailOtp(@Body() data: SendEmailOtpDto) {
    const result = await this.otpService.sendOtpToEmail(data.email);
    return { data: result };
  }

  @Post('verify-email-otp')
  async verifyEmailOtp(@Body() data: VerifyEmailOtpDto) {
    const isValid = await this.otpService.verifyEmailOtp(data.email, data.otp);
    return {
      data: {
        verified: isValid,
        message: 'Email OTP verified successfully',
      },
    };
  }

  @Post('send-phone-otp')
  async sendPhoneOtp(@Body() data: SendPhoneOtpDto) {
    const result = await this.otpService.sendOtpToPhone(data.phoneNumber);
    return { data: result };
  }

  @Post('verify-phone-otp')
  async verifyPhoneOtp(@Body() data: VerifyPhoneOtpDto) {
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

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Body() changePasswordData: ChangeShopPasswordDto) {
    const result = await this.shopsService.changePassword(
      changePasswordData.email,
      changePasswordData.oldPassword,
      changePasswordData.newPassword,
      changePasswordData.phoneNumber,
      changePasswordData.otp,
    );
    return { data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-email')
  async changeEmail(@Body() changeEmailData: ChangeShopEmailDto) {
    const result = await this.shopsService.changeEmail(
      changeEmailData.oldEmail,
      changeEmailData.newEmail,
      changeEmailData.oldOtp,
      changeEmailData.newOtp,
    );
    return { data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-phone-number')
  async changePhoneNumber(@Body() changePhoneData: ChangeShopPhoneDto) {
    const result = await this.shopsService.changePhoneNumber(
      changePhoneData.oldPhoneNumber,
      changePhoneData.newPhoneNumber,
      changePhoneData.oldOtp,
      changePhoneData.newOtp,
    );
    return { data: result };
  }
}
