const _ = require("lodash");

class CategoryController {
  constructor(Category, validator, User) {
    this.Category = Category;
    this.validateCategory = validator;
    this.User = User;
  }

  async create(req, res, next) {
    try {
      // Validate received data to create a new category
      const { error } = this.validateCategory(req.body);
      if (error) return res.status(400).send(error.message);

      // Create a new category with given data
      const category = await this.Category.create({
        name: req.body.name,
        type: req.body.type,
        userId: req.user.id,
      });

      // Return response
      return res.status(200).send(_.pick(category, ["name", "type"]));
    } catch (error) {
      // Pass the error to the next middleware for centralized error handling
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      // Find all categories
      const whereClause = { userId: req.user.id, deletedAt: null };
      if (req.query.type) {
        whereClause.type = req.query.type;
      }
      const allCategories = await this.Category.findAll({
        where: whereClause,
      });

      // Return response
      return res.status(200).send(allCategories);
    } catch (error) {
      // Handle database operation errors
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      // Validate received data to update a category
      const { error } = this.validateCategory(req.body);
      if (error) return res.status(400).send(error.message);

      // Look up for the category by given id
      const category = await this.Category.findOne({
        where: { id: req.params.id },
      });

      if (!category) return res.status(404).send("Category not found.");

      // Update the category
      category.name = req.body.name;
      category.type = req.body.type;
      await category.save();

      // Return response
      return res.status(200).send(_.pick(category, ["name", "type"]));
    } catch (error) {
      // Handle database operation errors
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      // Look up for the category by given id
      const category = await this.Category.findOne({
        where: { id: req.params.id },
      });
      // Handle finding category error
      if (!category) return res.status(404).send("Category not found.");

      // Soft delete the category
      category.deletedAt = new Date();
      category.name = "deleted_" + category.name;
      await category.save();

      // Return response
      return res.status(200).end();
    } catch (error) {
      // Handle database operation errors
      next(error);
    }
  }
}

module.exports = CategoryController;
