const _ = require("lodash");

class AccountController {
  constructor(Account, validate, User) {
    this.User = User;
    this.Account = Account;
    this.validateAccount = validate;
  }

  async create(req, res, next) {
    try {
      // Validate received data to create a new account
      const { error } = this.validateAccount(req.body);
      if (error) return res.status(400).send(error.message);

      // Create a new account with given data
      const account = await this.Account.create({
        name: req.body.name,
        userId: req.user.id,
      });

      return res.status(200).send(_.pick(account, ["name"]));
    } catch (error) {
      // Pass the error to the next middleware for centralized error handling
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      // Find all accounts
      const whereClause = { userId: req.user.id, deletedAt: null };
      const allAccounts = await this.Account.findAll({
        where: whereClause,
      });

      // Return response
      return res.status(200).send(allAccounts);
    } catch (error) {
      // Handle database operation errors
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      // Validate received data to update the account
      const { error } = this.validateAccount(req.body);
      if (error) return res.status(400).send(error.message);

      // Look up for the account by given id
      const account = await this.Account.findOne({
        where: { id: req.params.id },
      });

      // Return Error
      if (!account) return res.status(404).send("Account not found.");

      // Update the account
      account.name = req.body.name;
      await account.save();

      // Return response
      return res.status(200).send(_.pick(account, ["name"]));
    } catch (error) {
      // Handle database operation errors
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      // Look up for the account by given id
      const account = await this.Account.findOne({
        where: { id: req.params.id },
      });
      // Handle finding account error
      if (!account) return res.status(404).send("Account not found.");

      // Soft delete the account
      account.deletedAt = new Date();
      account.name = "deleted_" + account.name;
      await account.save();

      // Return response
      return res.status(204).end();
    } catch (error) {
      // Handle database operation errors
      next(error);
    }
  }
}

module.exports = AccountController;
