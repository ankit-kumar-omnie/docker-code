import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { UserDto } from '../dto/user.dto';
import { CreatePostDto } from '../dto/create.post.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/create')
  async userCreation(@Body() dto: UserDto) {
    return await this.userService.createUser(dto);
  }

  @Get(':id')
  async getAggregate(@Param('id') id: string) {
    return await this.userService.getAggregate(id);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() dto: UserDto) {
    // return await this.userService.updateUser(id,dto)
  }

  @Post('place')
  async createPost(@Body() dto: CreatePostDto) {
    return this.userService.processPlace(dto);
  }
}
