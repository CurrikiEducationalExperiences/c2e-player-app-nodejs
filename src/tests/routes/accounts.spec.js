const Router = require('../../routes/accounts');

describe('route/accounts', () => {
  it('should have expected api for /post route', async () => {
    const path = '/post';
    const result = await Router.stack.find((s) => s.route.path === path);
    expect(result).not.toBeUndefined();
    expect(result.route.path).toEqual(path);
    expect(result.route.methods).toEqual({ post: true });
  });

  it('should have expected api for /get route', async () => {
    const path = '/get';
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

  it('should have expected api for /delete route', async () => {
    const path = '/delete';
    const result = await Router.stack.find((s) => s.route.path === path);
    expect(result).not.toBeUndefined();
    expect(result.route.path).toEqual(path);
    expect(result.route.methods).toEqual({ delete: true });
  });

});
