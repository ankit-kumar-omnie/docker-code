import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "../service/user.service";
import { UserDto } from "../dto/user.dto";

@Controller('user')

export class UserController{
    constructor(private readonly userService:UserService){}

    @Post('/create')
    async userCreation(@Body() dto:UserDto){
        return await this.userService.createUser(dto)
    }
}