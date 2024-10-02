import { Injectable } from '@nestjs/common';
import { readFile } from 'fs';
import { writeFile, ensureDir } from 'fs-extra';
import { join } from 'path';
import * as sharp from 'sharp';

@Injectable()
export class UploadService {
  async compressImage(file: Express.Multer.File) {
    try {
      const compressedBuffer = await sharp(file.buffer)
        .resize(500)
        .webp({ quality: 80 })
        .toBuffer();
      const compressedFilePath = `uploads/${
        file.fieldname
      }-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
      await sharp(compressedBuffer).toFile(compressedFilePath);
      return compressedFilePath;
    } catch (error) {
      console.error('Failed to compress image:', error.message);
      throw new Error(`Failed to compress image: ${error.message}`);
    }
  }

  async getFileBuffer(filePath: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      readFile(filePath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  async saveJsonFile(data: any, filename: string) {
    const path = './metadata/collection/land/landspot/';
    const filenameNew = `${filename}.json`;
    await ensureDir(path);
    const filePath = join(path, filenameNew);
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return filePath;
  }
}
