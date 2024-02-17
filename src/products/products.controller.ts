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

@Controller('products')
export class ProductsController {
  constructor(private porductService: ProductsService) {}

  @Get()
  async getAllProducts() {
    const products = await this.porductService.products({
      take: 10,
      skip: 0,
    });

    if (!products) return 'No products found';
    return products;
  }

  @Post('add')
  @UseGuards(JwtAuthGuard)
  async addProduct(@Request() req, @Body() body: ProductPayloadDto) {
    const user = req.user;
    const product = await this.porductService.createProduct({
      name: body.name,
      description: body.description,
      price: body.price,
      user: {
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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

  // http://127.0.0.1:3001/products/filter?name=cat&price=36
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

    if (!results) return 'No products found';
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
