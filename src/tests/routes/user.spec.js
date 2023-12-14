const Router = require('../../routes/user');

describe('route/users', () => {
  it('should have expected api for /register route', async () => {
    const path = '/register';
    const result = await Router.stack.find((s) => s.route.path === path);
    expect(result).not.toBeUndefined();
    expect(result.route.path).toEqual(path);
    expect(result.route.methods).toEqual({ post: true });
  });

  it('should have expected api for /login route', async () => {
    const path = '/login';
    const result = await Router.stack.find((s) => s.route.path === path);
    expect(result).not.toBeUndefined();
    expect(result.route.path).toEqual(path);
    expect(result.route.methods).toEqual({ post: true });
  });

  it('should have expected api for /getProfile route', async () => {
    const path = '/getProfile';
    const result = await Router.stack.find((s) => s.route.path === path);
    expect(result).not.toBeUndefined();
    expect(result.route.path).toEqual(path);
    expect(result.route.methods).toEqual({ get: true });
  });

  it('should have expected api for /update route', async () => {
    const path = '/update';
    const result = await Router.stack.find((s) => s.route.path === path);
    expect(result).not.toBeUndefined();
    expect(result.route.path).toEqual(path);
    expect(result.route.methods).toEqual({ patch: true });
  });

  it('should have expected api for /delete/:id route', async () => {
    const path = '/delete/:id';
    const result = await Router.stack.find((s) => s.route.path === path);
    expect(result).not.toBeUndefined();
    expect(result.route.path).toEqual(path);
    expect(result.route.methods).toEqual({ delete: true });
  });

});
