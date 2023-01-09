import { ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto, FortyTwoUserDto } from './dto/auth.dto';
import axios, { AxiosError } from "axios";
import { response } from 'express';



@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}


  public getCookieWithJwtToken(_user: any) {
    const payload = {user :{ id : _user.id, email: _user.email, username: _user.username }};
    const token = this.jwt.sign(payload);
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${process.env.JWT_EXPIRATION_TIME}`;
  }



  // async getByEmail(dto: AuthDto) {
  //   const user = await this.prisma.user.findUnique({
  //     where: {
  //       email: dto.email,
  //     },
  //   });
  //   if (!user) {
  //     throw new ForbiddenException('User with this email does not exist');
  //   }
  //   await this.verifyPassword(dto.password, user.hash);
  //   delete user.hash;
  //   return user;
  // }

  // async verifyPassword(password: string, hash: string) {
  //   const isPasswordValid = await argon.verify(hash, password);
  //   if (!isPasswordValid) {
  //     throw new ForbiddenException('Invalid password');
  //   }
  // }

  // async addNewUser(dto: AuthDto) {
  //   try
  //   {
  //     const hash = await argon.hash(dto.password);
  //       const user = await this.prisma.user.create({
  //         data: {
  //           username: dto.username,
  //           email: dto.email,
  //           hash,
  //           first_name: dto.first_name || null,
  //           last_name: dto.last_name || null,
  //         },
  //       });
  //       return user;
  //   } catch (error) {
  //   if (error instanceof PrismaClientKnownRequestError) {
  //     if (error.code === 'P2002') {
  //       throw new ForbiddenException('Email already in use');
  //     }
  //     throw error;
  //   }
  // }
  // }


  async add42User(dto: FortyTwoUserDto) {
    try
    {
        const user = await this.prisma.user.create({
          data: {
            username: dto.login,
            email: dto.email,
            first_name: dto.first_name || null,
            last_name: dto.last_name || null,
            intra_id: dto.id,
            intra_url: dto.intra_url,
            avatar_url: dto.image.versions.large,
            isTwoFactorEnabled: dto.twoFactorAuth,
          },
        });
        return user;
    } catch (error) {
      console.log("error:",error);
    if (error instanceof PrismaClientKnownRequestError) {
      throw error;
    }
  }
  }

  async getAccessToken(code: string) {
  let ret : string;
		const  payload = {
			grant_type: 'authorization_code',
			client_id: process.env.CLIENT_ID,
			client_secret: process.env.CLIENT_SECRET,
			redirect_uri: process.env.CALLBACK_URL,
			code : code
		};
		await axios({
			method: 'post',
			url: 'https://api.intra.42.fr/oauth/token',
			data: JSON.stringify(payload),
			headers: {
				'Content-Type': 'application/json'
			}
		})
		.then((res) => {
			ret = res.data.access_token;
			return ret;
		})
		.catch((err: AxiosError) => { 
      console.log(err.response.data);
		})
		return ret; 
}

async lesInformationsDeLutilisateur(token: string) {
  let ret : any;
  await axios({
    method: 'get',
    url: 'https://api.intra.42.fr/v2/me',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then((res) => {
    ret = res.data;
    return ret;
  })
  .catch((err: AxiosError) => { 
    (err.response.data);
  })
  return ret; 
}

async checkIfUserExist(user: number) {
  const is_here = await this.prisma.user.findFirst({
    where: {
      intra_id: user,
    },
  });
  return is_here;
}

public getCookieForLogOut() {
  return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
}
  // async checkIfUserHas2fa(user: number) : Promise<boolean> {
  //   const is_here = await this.prisma.user.findFirst({
  //     where: {
  //       intra_id: user,
  //     },
  //   });
  //   return is_here.isTwoFactorEnabled;
  // }
}