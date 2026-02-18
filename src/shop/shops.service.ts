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
import {
  ShopInformationDto,
  type addressDto,
  type shopNameDto,
} from './dtos/ShopInformation.dto';
import { LoginDto } from './dtos/Login.dto';
import { AuthService } from '../auth/auth.service';
import { OtpService } from '../customer/otp.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ShopsService {
  constructor(
    @InjectModel(Shops.name) private shopsModel: Model<Shops>,
    @InjectModel(TableTypes.name) private tableTypesModel: Model<TableTypes>,
    private authService: AuthService,
    private otpService: OtpService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async registerShopPartner(
    shopData: ShopInformationDto,
    file?: Express.Multer.File,
  ) {
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

    // Upload image to Cloudinary if file is provided
    let shopImageUrl = shopData.shop_img || '';
    if (file) {
      shopImageUrl = await this.cloudinaryService.uploadImage(file);
    }

    // First, create the shop without table types
    const newShop = new this.shopsModel({
      name: shopData.name,
      address: {
        fullAddress: shopData.fullAddress,
        location: {
          type: 'Point',
          coordinates: [shopData.lng, shopData.lat],
        },
      },
      phoneNumber: shopData.phoneNumber,
      email: shopData.email,
      password: hashedPassword,
      shopImg: shopImageUrl,
      description: shopData.description,
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
        email: loginData.email,
      })
      .select('+password');

    if (!existingShop) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Compare password using bcrypt
    const isPasswordValid = await bcrypt.compare(
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
    return shopData;
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
    return shopData;
  }

  async changeAddress(addressData: addressDto) {
    await this.shopsModel.findByIdAndUpdate(
      addressData.shop_id,
      {
        address: {
          fullAddress: addressData.fullAddress,
          location: {
            type: 'Point',
            coordinates: [addressData.lng, addressData.lat], // ⚠ important
          },
        },
      },
      { new: true },
    );
    const shopData = await this.shopsModel.findById(addressData.shop_id);
    return shopData;
  }

  async changeShopName(shopData: shopNameDto) {
    await this.shopsModel.findByIdAndUpdate(
      shopData.shop_id,
      {
        name: shopData.shopTitle,
      },
      { new: true },
    );
    const shop = await this.shopsModel.findById(shopData.shop_id);
    return shop;
  }

  async changeProfileImage(shop_id: string, file: Express.Multer.File) {
    // Validate shop exists
    const shop = await this.shopsModel.findById(shop_id);
    if (!shop) {
      throw new NotFoundException('Shop not found.');
    }

    // Validate file
    if (!file) {
      throw new BadRequestException('Image file is required.');
    }

    try {
      // Upload new image to Cloudinary
      const imageUrl = await this.cloudinaryService.uploadImage(file);

      // Update shop with new image URL
      await this.shopsModel.findByIdAndUpdate(
        shop_id,
        {
          shopImg: imageUrl,
        },
        { new: true },
      );

      // Return updated shop
      const updatedShop = await this.shopsModel.findById(shop_id);
      return updatedShop;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw new BadRequestException(
        'Failed to upload image. Please check Cloudinary configuration.',
      );
    }
  }
}
