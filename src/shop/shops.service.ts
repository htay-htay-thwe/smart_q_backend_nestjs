import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { Shops } from '../schemas/Shops.schema';
import { TableTypes } from '../schemas/TableTypes.schema';
import { InjectModel } from '@nestjs/mongoose';
import { ShopInformationDto } from './dtos/ShopInformation.dto';
import { LoginDto } from './dtos/Login.dto';
import { AuthService } from '../auth/auth.service';
import { OtpService } from '../customer/otp.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ShopsService {
  constructor(
    @InjectModel(Shops.name) private shopsModel: Model<Shops>,
    @InjectModel(TableTypes.name) private tableTypesModel: Model<TableTypes>,
    private authService: AuthService,
    private otpService: OtpService,
  ) {}

  async registerShopPartner(shopData: ShopInformationDto) {
    // Check if email is verified
    const isEmailVerified = await this.otpService.isEmailVerified(
      shopData.email,
    );

    if (!isEmailVerified) {
      throw new BadRequestException(
        'Email not verified. Please verify with OTP first.',
      );
    }

    // Check if phone is verified
    const isPhoneVerified = await this.otpService.isPhoneVerified(
      shopData.phoneNumber,
    );

    if (!isPhoneVerified) {
      throw new BadRequestException(
        'Phone number not verified. Please verify with OTP first.',
      );
    }

    // Check if email already exists
    const existingShop = await this.shopsModel.findOne({
      email: shopData.email,
    });

    if (existingShop) {
      throw new ConflictException(
        'Email already exists. Please use a different email.',
      );
    }

    // Check if phone number already exists
    const existingPhone = await this.shopsModel.findOne({
      phoneNumber: shopData.phoneNumber,
    });

    if (existingPhone) {
      throw new ConflictException(
        'Phone number already exists. Please use a different phone number.',
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(shopData.password, 10);

    // First, create the shop without table types
    const newShop = new this.shopsModel({
      name: shopData.name,
      address: shopData.address,
      phoneNumber: shopData.phoneNumber,
      email: shopData.email,
      password: hashedPassword,
      shopImg: shopData.shop_img,
      shopTitle: shopData.shopTitle,
      description: shopData.descirption,
      shopTypes: shopData.shopTypeId,
    });

    const savedShop = await newShop.save();

    // Now create table types with the real shop ID
    const tableTypePromises = shopData.tableTypes.map((tableType) => {
      const newTableType = new this.tableTypesModel({
        type: tableType.type,
        capacity: tableType.capacity,
        shopId: savedShop._id.toString(),
        left_capacity: tableType.capacity.toString(),
        bookTableId: null,
      });
      return newTableType.save();
    });

    const savedTableTypes = await Promise.all(tableTypePromises);

    // Update shop with table type IDs
    await this.shopsModel.findByIdAndUpdate(savedShop._id, {
      tableTypes: savedTableTypes.map((tt) => tt._id),
    });

    const shop = await this.shopsModel
      .findById(savedShop._id)
      .populate('shopTypes')
      .populate('tableTypes')
      .exec();

    if (!shop) {
      throw new Error('Shop not found after creation');
    }

    const token = this.authService.generateToken({
      id: shop._id.toString(),
      email: shop.email,
      type: 'shop',
    });

    return {
      shop,
      token,
    };
  }

  async loginShopPartner(loginData: LoginDto) {
    // Find shop with password field (it's normally excluded due to select: false)
    const existingShop = await this.shopsModel
      .findOne({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        email: loginData.email,
      })
      .select('+password');

    if (!existingShop) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Compare password using bcrypt
    const isPasswordValid = await bcrypt.compare(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      loginData.password,
      existingShop.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Get shop with populated fields
    const shop = await this.shopsModel
      .findById(existingShop._id)
      .populate('shopTypes')
      .populate('tableTypes')
      .exec();

    if (!shop) {
      throw new Error('Shop not found');
    }

    const token = this.authService.generateToken({
      id: shop._id.toString(),
      email: shop.email,
      type: 'shop',
    });

    return {
      shop,
      token,
    };
  }

  async findAll() {
    return await this.shopsModel
      .find()
      .populate('shopTypes')
      .populate('tableTypes')
      .exec();
  }

  async changePassword(
    email: string,
    oldPassword: string,
    newPassword: string,
    phoneNumber: number,
    otp: string,
  ) {
    const shop = await this.shopsModel.findOne({ email }).select('+password');

    if (!shop) {
      throw new NotFoundException('Shop not found.');
    }

    // Check if password exists
    if (!shop.password) {
      throw new UnauthorizedException(
        'Password not set for this account. Please contact support.',
      );
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, shop.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid old password.');
    }

    // Verify OTP for phone number
    const isOtpValid = await this.otpService.verifyPhoneOtp(phoneNumber, otp);
    if (!isOtpValid) {
      throw new UnauthorizedException('Invalid OTP.');
    }

    shop.password = await bcrypt.hash(newPassword, 10);
    await shop.save();
    return { message: 'Password changed successfully.' };
  }

  async changePhoneNumber(
    oldPhoneNumber: number,
    newPhoneNumber: number,
    oldOtp: string,
    newOtp: string,
  ) {
    // Verify OTP for old phone number
    const isOldOtpValid = await this.otpService.verifyPhoneOtp(
      oldPhoneNumber,
      oldOtp,
    );
    if (!isOldOtpValid) {
      throw new UnauthorizedException('Invalid OTP for old phone number.');
    }

    // Verify OTP for new phone number
    const isNewOtpValid = await this.otpService.verifyPhoneOtp(
      newPhoneNumber,
      newOtp,
    );
    if (!isNewOtpValid) {
      throw new UnauthorizedException('Invalid OTP for new phone number.');
    }

    const shop = await this.shopsModel.findOne({
      phoneNumber: oldPhoneNumber,
    });
    if (!shop) {
      throw new NotFoundException('Shop not found.');
    }

    // Check if new phone number is already taken
    const existingShop = await this.shopsModel.findOne({
      phoneNumber: newPhoneNumber,
    });
    if (existingShop) {
      throw new ConflictException('New phone number is already registered.');
    }

    shop.phoneNumber = newPhoneNumber;
    await shop.save();
    const shopData = await this.shopsModel.findById(shop._id);
    return {
      data: shopData,
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
    const isOldOtpValid = await this.otpService.verifyEmailOtp(
      oldEmail,
      oldOtp,
    );
    if (!isOldOtpValid) {
      throw new UnauthorizedException('Invalid OTP for old email.');
    }

    // Verify OTP for new email
    const isNewOtpValid = await this.otpService.verifyEmailOtp(
      newEmail,
      newOtp,
    );
    if (!isNewOtpValid) {
      throw new UnauthorizedException('Invalid OTP for new email.');
    }

    const shop = await this.shopsModel.findOne({ email: oldEmail });

    if (!shop) {
      throw new NotFoundException('Shop not found.');
    }

    // Check if new email is already taken
    const existingShop = await this.shopsModel.findOne({
      email: newEmail,
    });
    if (existingShop) {
      throw new ConflictException('New email is already registered.');
    }

    shop.email = newEmail;
    await shop.save();
    const shopData = await this.shopsModel.findById(shop._id);
    return {
      data: shopData,
      message: 'Email changed successfully.',
    };
  }
}
