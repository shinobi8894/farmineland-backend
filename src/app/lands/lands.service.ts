import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UploadService } from '../upload/upload.service';
import * as fs from 'fs';
import { RaffleDto } from './dto/raffle.dto';
import { LandsAbi__factory } from 'src/contracts';
import { landsAddress } from 'src/constants';
import { ethers } from 'ethers';

@Injectable()
export class LandsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async findAll() {
    const lands = await this.prisma.house.findMany();
    await Promise.all(
      lands.map(async (land) => {
        const nameJson = await this.parseString(land.name);
        const pathname = nameJson.landzone + nameJson.landplot;
        return await this.uploadService.saveJsonFile(land.json_data, pathname);
      }),
    );
    return lands;
  }

  async getFilesBySize(files: string[], sizeCodes: string[]) {
    return files.filter((file) => {
      const match = file.match(/(\d{2})(?=\.\w+$)/);
      const fileCode = match ? match[1] : null;
      console.log(sizeCodes);
      return sizeCodes.includes(fileCode);
    });
  }

  async getRandomFile(files: string[]) {
    const randomIndex = Math.floor(Math.random() * files.length);
    return files[randomIndex];
  }

  async extractCategoryFromUrl(url: string) {
    const parts = url.split('/');
    const filename = parts.pop();
    const name = filename.slice(0, -5);
    return name;
  }

  async raffleLand(payload: RaffleDto) {
    const privateKey = process.env.PRIVATE_KEY;
    const signer = new ethers.Wallet(privateKey);
    const provider = new ethers.JsonRpcProvider(
      'https://polygon-mainnet.infura.io',
    );
    const newSigner = signer.connect(provider);
    const landsContract = LandsAbi__factory.connect(landsAddress, newSigner);
    const address = await landsContract.ownerOf(payload.uriToken);
    if (address !== payload.address) {
      throw new Error('Is not the owner of the tokenId');
    }
    const tokenUri = await landsContract.tokenURI(payload.uriToken);
    const size = await this.extractCategoryFromUrl(tokenUri);
    console.log(size)
    const files = await this.findAllSavedLand();

    if (files.length === 0) {
      throw new Error('Não há arquivos no diretório');
    }
    const categories = {
      large: ['01', '02'],
      med: ['03', '04', '05', '06'],
      small: ['07', '08', '09', '10', '11'],
    };

    console.log(size)
    const sizeCodes = categories[size];

    const filteredFiles = await this.getFilesBySize(files, sizeCodes);
    const randomFile = await this.getRandomFile(filteredFiles);
    const tx = await landsContract.setTokenURI(payload.uriToken, randomFile);
    const tx2 = await tx.wait(1);
    return tx2.hash;
  }

  async findAllSavedLand() {
    try {
      const pathName = './metadata/collection/land/landspot/';
      const prodLink =
        'https://api.farmine.land/metadata/collection/land/landspot/';
      const files = fs.readdirSync(pathName);
      return files.map((file) => prodLink + file);
    } catch (error) {
      throw new Error(`Não foi possível ler o diretório: ${error.message}`);
    }
  }

  async parseString(input: string) {
    const pairs = input.split(',');
    const result = pairs.reduce((acc, pair) => {
      const [key, value] = pair.split(':');
      acc[key] = value;
      return acc;
    }, {});
    return result as any;
  }
}
