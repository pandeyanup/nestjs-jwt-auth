import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ProductsService } from './products.service';
import { ProductPayloadDto } from './dto/product.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Role } from '@prisma/client';

@Controller('products')
export class ProductsController {
  constructor(private readonly porductService: ProductsService) {}

  @Get()
  async getAllProducts() {
    const products = await this.porductService.products({
      take: 10,
      skip: 0,
    });

    if (products.length === 0) {
      return new HttpException('No products found', HttpStatus.NOT_FOUND);
    }
    return products;
  }

  @Post('add')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async addProduct(@Request() req, @Body() body: ProductPayloadDto) {
    const user = req.user;
    const product = await this.porductService.createProduct({
      name: body.name,
      description: body.description,
      price: body.price,
      User: {
        connect: {
          id: user.id,
        },
      },
    });
    if (!product)
      return new HttpException(
        'Error creating product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    return product;
  }

  @Delete('delete/:id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async deleteProduct(@Request() req, @Param('id') id: string) {
    const prodcut = await this.porductService.product({ id });
    if (!prodcut)
      return new HttpException('Product not found', HttpStatus.NOT_FOUND);

    if (prodcut.userId !== req.user.id) {
      return new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const deletedProduct = await this.porductService.deleteProduct({ id });
    if (!deletedProduct)
      return new HttpException(
        'Error deleting product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    return deletedProduct;
  }

  @Patch('update/:id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.MODERATOR)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async updateProduct(
    @Request() req,
    @Param('id') id: string,
    @Body() body: ProductPayloadDto,
  ) {
    const prodcut = await this.porductService.product({ id });
    if (!prodcut) {
      return new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    if (prodcut.userId !== req.user.id) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const updatedProduct = await this.porductService.updateProduct({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
      },
    });
    if (!updatedProduct) {
      return new HttpException(
        'Error updating product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return updatedProduct;
  }

  @Get('filter')
  async filterProducts(@Request() req) {
    const { name, price } = req.query;
    const parsedPrice = parseFloat(price);
    const results = await this.porductService.products({
      where: {
        name: {
          contains: name,
        },
        price: {
          gte: parsedPrice,
        },
      },
    });

    if (results.length === 0) {
      return new HttpException('No products found', HttpStatus.NOT_FOUND);
    }
    return results;
  }

  @Get(':id')
  async productById(@Request() req, @Param('id') id: string) {
    const product = await this.porductService.product({ id: id });
    if (!product)
      return new HttpException('Product not found', HttpStatus.NOT_FOUND);
    return product;
  }
}
