import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.CLOUD_API_SECRET,
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'shops' },
        (error, result) => {
          if (error) return reject(error);
          if (!result) {
            return reject(
              new Error('Upload failed: No result from Cloudinary'),
            );
          }
          resolve(result.secure_url);
        },
      );

      Readable.from(file.buffer).pipe(upload);
    });
  }
}
