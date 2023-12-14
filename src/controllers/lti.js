const {ltiService} = require('../service/lti');

class ltiController {
  static async grade(req, res) {
    try {
      const result = await ltiService.grade(req, res);
      if (!result) return res.sendStatus(500);
      return res.send(result);
    } catch (err) {
      console.log(err.message);
      return res.status(500).send({ err: err.message });
    }  
  }
  static async members(req, res) {
    try {
      const result = await ltiService.members(req, res);
      if (!result) return res.sendStatus(500);
      return res.send(result);
    } catch (err) {
      console.log(err.message);
      return res.status(500).send({ err: err.message });
    }  
  }
  static async deeplink(req, res) {
    try {
      const result = await ltiService.deeplink(req, res);
      if (!result) return res.sendStatus(500);
      return res.send(result);
    } catch (err) {
      console.log(err.message);
      return res.status(500).send({ err: err.message });
    }  
  }
  static async play(req, res) {
    try {
      const result = await ltiService.play(req, res);
      if (!result) return res.sendStatus(500);
      return res.send(result);
    } catch (err) {
      console.log(err.message);
      return res.status(500).send({ err: err.message });
    }  
  }

  static async info(req, res) {
    try {
      const result = await ltiService.info(req, res);
      if (!result) return res.sendStatus(500);
      return res.send(result);
    } catch (err) {
      console.log(err.message);
      return res.status(500).send({ err: err.message });
    }  
  }

  static async resources(req, res) {
    try {
      const result = await ltiService.resources(req, res);
      if (!result) return res.sendStatus(500);
      if(result === 400) res.status(400).send("Invalid parameter type");
      return res.send(result);
    } catch (err) {
      console.log(err.message);
      return res.status(500).send({ err: err.message });
    }  
  }

  static async stream(req, res) {
    try {
      const result = await ltiService.stream(req, res);
      if (!result) return res.sendStatus(500);
      return res.send(result);
    } catch (err) {
      console.log(err.message);
      return res.status(500).send({ err: err.message });
    }  
  }

  static async registerPlatform(req, res) {
    try {
      const result = await ltiService.registerPlatform(req.body);
      if (!result) return res.status(400).send('Invalid parameters.');
      return res.send(result);
    } catch (err) {
      console.log(err.message);
      return res.status(500).send({ err: err.message });
    }  
  }
}

module.exports = { ltiController };
