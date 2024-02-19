import {
  Controller,
  Get,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Controller()
export class ImageController {
  @Get()
  getHello(): string {
    return 'Hello from: GET /api/upload/image';
  }

  // get the file from the request and save the file to mysql database
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  public async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: 'image/jpeg' })
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
  ) {
    // save file to local storage
    const id = uuidv4();
    const filePath = `./uploads/${id}-${file.originalname}`;
    fs.writeFileSync(filePath, file.buffer);
    return { filePath };
  }
}
