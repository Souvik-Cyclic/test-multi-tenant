import { Controller, Get, Req } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  checkSubdomain(
    @Req() req: Request,
  ): string {
    const subdomain = req['subdomain'];
    return `Subdomain: ${subdomain ? subdomain : 'No subdomain found'}`;
  }
}
