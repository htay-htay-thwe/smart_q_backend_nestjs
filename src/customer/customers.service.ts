/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Customers } from '../schemas/Customers.schema';
import { Model } from 'mongoose';
import { CustomerInformationDto } from './dtos/CustomerInformation.dto';
import { AuthService } from '../auth/auth.service';
import { OtpService } from './otp.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customers.name) private customersModel: Model<Customers>,
    private authService: AuthService,
    private otpService: OtpService,
  ) {}

  async registerCustomer(userData: CustomerInformationDto) {
    // Check if phone is verified
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const isVerified = await this.otpService.isPhoneVerified(
      userData.phoneNumber,
    );

    if (!isVerified) {
      throw new BadRequestException(
        'Phone number not verified. Please verify with OTP first.',
      );
    }

    // Check if phone number already exists
    const existingPhone = await this.customersModel.findOne({
      phoneNumber: userData.phoneNumber,
    });

    if (existingPhone) {
      throw new ConflictException(
        'Phone number already registered. Please login instead.',
      );
    }

    const newCustomer = new this.customersModel({
      name: userData.name,
      phoneNumber: userData.phoneNumber,
      password: await bcrypt.hash(userData.password, 10),
      profileImg: userData.profileImg || '',
      isVerified: true,
    });

    const savedCustomer = await newCustomer.save();

    const token = this.authService.generateToken({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      id: savedCustomer._id.toString(),
      email: savedCustomer.phoneNumber.toString(),
      type: 'customer',
    });

    return {
      customer: savedCustomer,
      token,
    };
  }

  async findByPhone(phoneNumber: number) {
    const customer = await this.customersModel.findOne({ phoneNumber });

    if (!customer) {
      throw new NotFoundException('Customer not found. Please register first.');
    }

    return customer;
  }

  generateTokenForCustomer(customer: Customers) {
    return this.authService.generateToken({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      id: customer._id.toString(),
      email: customer.phoneNumber.toString(),
      type: 'customer',
    });
  }

  async loginCustomer(phoneNumber: number, otp: string, password: string) {
    // Verify OTP first
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const isOtpValid = await this.otpService.verifyPhoneOtp(phoneNumber, otp);

    if (!isOtpValid) {
      throw new UnauthorizedException('Invalid OTP.');
    }

    // Find customer with password field
    const customer = await this.customersModel
      .findOne({ phoneNumber })
      .select('+password');

    if (!customer) {
      throw new UnauthorizedException('Invalid phone number or password.');
    }

    // Check if password exists
    if (!customer.password) {
      throw new UnauthorizedException(
        'Password not set for this account. Please contact support.',
      );
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, customer.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid phone number or password.');
    }

    // Get customer without password
    const customerData = await this.customersModel.findById(customer._id);

    if (!customerData) {
      throw new NotFoundException('Customer not found.');
    }

    const token = this.generateTokenForCustomer(customerData);

    return {
      customer: customerData,
      token,
    };
  }

  async changePassword(
    phoneNumber: number,
    oldPassword: string,
    newPassword: string,
    otp: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const isOtpValid = await this.otpService.verifyPhoneOtp(phoneNumber, otp);

    if (!isOtpValid) {
      throw new UnauthorizedException('Invalid OTP.');
    }

    const customer = await this.customersModel
      .findOne({ phoneNumber })
      .select('+password');

    if (!customer) {
      throw new NotFoundException('Customer not found.');
    }

    // Check if password exists
    if (!customer.password) {
      throw new UnauthorizedException(
        'Password not set for this account. Please contact support.',
      );
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      customer.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid old password.');
    }

    customer.password = await bcrypt.hash(newPassword, 10);
    await customer.save();
    return { message: 'Password changed successfully.' };
  }

  async changePhoneNumber(
    oldPhoneNumber: number,
    newPhoneNumber: number,
    oldOtp: string,
    newOtp: string,
  ) {
    // Verify OTP for old phone number
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const isOldOtpValid = await this.otpService.verifyPhoneOtp(
      oldPhoneNumber,
      oldOtp,
    );
    if (!isOldOtpValid) {
      throw new UnauthorizedException('Invalid OTP for old phone number.');
    }

    // Verify OTP for new phone number
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const isNewOtpValid = await this.otpService.verifyPhoneOtp(
      newPhoneNumber,
      newOtp,
    );
    if (!isNewOtpValid) {
      throw new UnauthorizedException('Invalid OTP for new phone number.');
    }

    const customer = await this.customersModel.findOne({
      phoneNumber: oldPhoneNumber,
    });
    if (!customer) {
      throw new NotFoundException('Customer not found.');
    }

    // Check if new phone number is already taken
    const existingCustomer = await this.customersModel.findOne({
      phoneNumber: newPhoneNumber,
    });
    if (existingCustomer) {
      throw new ConflictException('New phone number is already registered.');
    }

    customer.phoneNumber = newPhoneNumber;
    await customer.save();
    const customerData = await this.customersModel.findById(customer._id);
    return {
      data: customerData,
      message: 'Phone number changed successfully.',
    };
  }
}
