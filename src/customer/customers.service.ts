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
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import * as bcrypt from 'bcrypt';
import { CustomerLoginDto } from './dtos/CustomerLogin.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customers.name) private customersModel: Model<Customers>,
    private authService: AuthService,
    private otpService: OtpService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async registerCustomer(
    userData: CustomerInformationDto,
    file?: Express.Multer.File,
  ) {
    if (!userData.email && !userData.phoneNumber) {
      throw new BadRequestException(
        'Either email or phone number must be provided.',
      );
    }
    
    // by email
    if (userData.email) {
    const isEmailVerified = await this.otpService.isEmailVerified(
      userData.email,
    );

    if (!isEmailVerified) {
      throw new BadRequestException(
        'Email not verified. Please verify with OTP first.',
      );
    }

    const existingEmail = await this.customersModel.findOne({
      email: userData.email,
    });

    if (existingEmail) {
      throw new ConflictException(
        'Email already exists. Please use a different email.',
      );
    }
  }

  // by phone number
     if (userData.phoneNumber) {
    const isPhoneVerified = await this.otpService.isPhoneVerified(
      userData.phoneNumber,
    );

    if (!isPhoneVerified) {
      throw new BadRequestException(
        'Phone number not verified. Please verify with OTP first.',
      );
    }

    const existingPhone = await this.customersModel.findOne({
      phoneNumber: userData.phoneNumber,
    });

    if (existingPhone) {
      throw new ConflictException(
        'Phone number already registered. Please login instead.',
      );
    }
  }

    // Upload image to Cloudinary if file is provided
    let profileImageUrl = userData.profileImg || '';
    if (file) {
      profileImageUrl = await this.cloudinaryService.uploadImage(file);
    }

    const newCustomer = new this.customersModel({
      name: userData.name,
      email: userData.email || null,
      phoneNumber: userData.phoneNumber || null,
      password: await bcrypt.hash(userData.password, 10),
      profileImg: profileImageUrl || null,
      isVerified: true,
    });

    const savedCustomer = await newCustomer.save();

    const token = this.generateTokenForCustomer(savedCustomer);

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
      email: customer.email,
      type: 'customer',
    });
  }

  async loginCustomer(loginData: CustomerLoginDto) {
    // Find customer with password field
    const customer = loginData.phoneNumber
      ? await this.customersModel
          .findOne({ phoneNumber: loginData.phoneNumber })
          .select('+password')
      : await this.customersModel
          .findOne({ email: loginData.email })
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
    const isPasswordValid = await bcrypt.compare(
      loginData.password,
      customer.password,
    );

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

  async changeEmail(
    oldEmail: string,
    newEmail: string,
    oldOtp: string,
    newOtp: string,
  ) {
    // Verify OTP for old email
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const isOldOtpValid = await this.otpService.verifyEmailOtp(
      oldEmail,
      oldOtp,
    );
    if (!isOldOtpValid) {
      throw new UnauthorizedException('Invalid OTP for old email.');
    }

    // Verify OTP for new email
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const isNewOtpValid = await this.otpService.verifyEmailOtp(
      newEmail,
      newOtp,
    );
    if (!isNewOtpValid) {
      throw new UnauthorizedException('Invalid OTP for new email.');
    }

    const customer = await this.customersModel.findOne({
      email: oldEmail,
    });
    if (!customer) {
      throw new NotFoundException('Customer not found.');
    }

    // Check if new email is already taken
    const existingCustomer = await this.customersModel.findOne({
      email: newEmail,
    });
    if (existingCustomer) {
      throw new ConflictException('New email is already registered.');
    }

    customer.email = newEmail;
    await customer.save();
    const customerData = await this.customersModel.findById(customer._id);
    return {
      data: customerData,
      message: 'Email changed successfully.',
    };
  }

  async changeProfileImage(customer_id: string, file: Express.Multer.File) {
    const customer = await this.customersModel.findById(customer_id);
    if (!customer) {
      throw new NotFoundException('Customer not found.');
    }
    const imageUrl = await this.cloudinaryService.uploadImage(file);
    customer.profileImg = imageUrl;
    await customer.save();
    const customerData = await this.customersModel.findById(customer_id);
    return {
      data: customerData,
      message: 'Customer Image changed successfully.',
    };
  }

  async changeUsername(customer_id: string, newUsername: string) {
    const customer = await this.customersModel.findById(customer_id);
    if (!customer) {
      throw new NotFoundException('Customer not found.');
    }
    customer.name = newUsername;
    await customer.save();
    const customerData = await this.customersModel.findById(customer_id);
    return {
      data: customerData,
      message: 'Customer Username changed successfully.',
    };
  }
}
