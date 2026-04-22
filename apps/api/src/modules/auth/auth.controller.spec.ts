import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RolesService } from './roles.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
            forgotPassword: jest.fn(),
            resetPassword: jest.fn(),
            sendMagicLink: jest.fn(),
            loginWithMagicLink: jest.fn(),
            validateOAuthUser: jest.fn(),
            generateTokens: jest.fn(),
            generate2FA: jest.fn(),
            enable2FA: jest.fn(),
            verify2FA: jest.fn(),
            getSessions: jest.fn(),
            revokeSession: jest.fn(),
            changePassword: jest.fn(),
          },
        },
        {
          provide: RolesService,
          useValue: {
            findByName: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
