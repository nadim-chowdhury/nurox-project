import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Security')
@Controller('.well-known')
export class SecurityController {
  @Get('security.txt')
  @Header('Content-Type', 'text/plain')
  @ApiOperation({ summary: 'Get security disclosure policy' })
  getSecurityTxt(): string {
    return `Contact: security@nurox.app
Expires: 2030-01-01T00:00:00.000Z
Acknowledgments: https://nurox.app/security/hall-of-fame
Preferred-Languages: en
Canonical: https://nurox.app/.well-known/security.txt
Policy: https://nurox.app/security/policy
`;
  }
}
