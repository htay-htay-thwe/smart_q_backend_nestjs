import {
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { CustomersService } from './customers.service';
import {
  ChangeUsernameDto,
  CustomerInformationDto,
} from './dtos/CustomerInformation.dto';
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
  @UseInterceptors(FileInterceptor('profileImg'))
  async registerCustomer(
    @Body() userData: CustomerInformationDto,
    @UploadedFile() file: Express.Multer.File,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.customersService.registerCustomer(userData, file);

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
  @Patch('change-password')
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
  @Patch('change-phone-number')
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
  @Patch('change-email')
  async changeEmail(@Body() changeEmailData: ChangeEmailDto) {
    const result = await this.customersService.changeEmail(
      changeEmailData.oldEmail,
      changeEmailData.newEmail,
      changeEmailData.oldOtp,
      changeEmailData.newOtp,
    );
    return { data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-username')
  async changeUsername(@Body() changeUsernameData: ChangeUsernameDto) {
    const result = await this.customersService.changeUsername(
      changeUsernameData.customer_id,
      changeUsernameData.newUsername,
    );
    return { data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-profileImage')
  @UseInterceptors(FileInterceptor('image'))
  async changeProfileImage(
    @Body('customer_id') customer_id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log(customer_id);
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    const customerData = await this.customersService.changeProfileImage(
      customer_id,
      file,
    );
    return {
      data: customerData,
      message: 'Customer Image changed successfully.',
    };
  }
}
