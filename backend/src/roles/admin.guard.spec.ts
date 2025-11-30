import { AdminGuard } from './admin.guard';

describe('RolesGuard', () => {
  it('should be defined', () => {
    expect(new AdminGuard()).toBeDefined();
  });
});
