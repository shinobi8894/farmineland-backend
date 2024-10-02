import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { PrismaService } from 'src/database/prisma.service';

@ValidatorConstraint({ name: 'IsUniqueConstraint', async: true })
@Injectable()
export class IsUnique implements ValidatorConstraintInterface {
  constructor(private readonly prisma: PrismaService) {}

  async validate(value: any, args?: ValidationArguments): Promise<boolean> {
    const [modelName, column] = args?.constraints as string[];
    const model = this.prisma[modelName];

    const dataExist = await model.findFirst({
      where: { [column]: value },
    });

    return !dataExist;
  }

  defaultMessage(validationArguments: ValidationArguments): string {
    const field = validationArguments.property;
    return `${field} is already exist.`;
  }
}
