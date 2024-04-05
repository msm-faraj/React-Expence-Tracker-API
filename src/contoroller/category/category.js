const _ = require("lodash");

class CategoryController {
  constructor(Category, validator, User) {
    this.Category = Category;
    this.validateCategory = validator;
    this.User = User;
  }

  async create(req, res) {
    //Validte received data to create a new category
    const { error } = this.validateCategory(req.body);
    if (error) return res.status(400).send(error.message);
    //Find the authorized user
    const user = await this.User.findOne({ where: { id: req.user.id } });

    //Prevent duplication in category table for a user
    const existingCategory = await this.Category.findOne({
      where: {
        userId: user.id,
        name: req.body.name,
        type: req.body.type,
      },
    });
    if (existingCategory) {
      return res.send("this category has been defined");
    }

    //Create a new user with given data
    const category = await this.Category.create({
      name: req.body.name,
      type: req.body.type,
      userId: user.id,
    });
    res.status(200).send(category);
  }

  async update(req, res) {
    //Validate received data to update a category
    const { error } = this.validateCategory(req.body);
    if (error) return res.status(400).send(error.message);
    //Find the authorized user
    const user = await this.User.findOne({ where: { id: req.user.id } });
    //Prevent duplication in category table for a user
    const existingCategory = await this.Category.findOne({
      where: {
        userId: user.id,
        name: req.body.name,
        type: req.body.type,
      },
    });
    if (existingCategory) {
      return res.send("this category has been defined");
    }
    // Look up for the category by given id
    const category = await this.Category.findOne({
      where: { id: req.params.id },
    });
    //Update category
    category.name = req.body.name;
    category.type = req.body.type;
    category.save();
    return res.send(_.pick(category, ["name", "type"]));
  }

  //** OK **//
  async delete(req, res) {
    //Look up for the category by given id
    const category = await this.Category.findOne({
      where: { id: req.params.id },
    });
    category.deletedAt = new Date();
    category.name = "deleted_" + category.name;
    await category.save();
    return res.send("Deleted");
  }

  //** OK **//
  async getSome(req, res) {
    const someCategories = await this.Category.findAll({
      where: { type: req.params.type, deletedAt: null },
    });
    if (!someCategories)
      return res.status(404).send("The category was not found");
    return res.status(200).send(someCategories);
  }
}

module.exports = CategoryController;
