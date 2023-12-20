const { AdminService } = require("../service/admin");

class AdminController {
  static async registerPlatform(req, res, next) {
    try {
      const result = await AdminService.registerPlatform(req.body);
      if (!result) return res.status(400).send('Invalid parameters.');
      return res.status(200).send("Platform registered successfully.");
    } catch (error) {
      next(error);
    }
  }
  
}

module.exports = { AdminController };
