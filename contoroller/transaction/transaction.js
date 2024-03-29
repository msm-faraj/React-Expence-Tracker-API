class TransactionController {
  constructor(Transactions, validator, User, Account, Category) {
    this.Transaction = Transactions;
    this.validateTransaction = validator;
    this.User = User;
    this.Account = Account;
    this.Category = Category;
  }
  //ok
  async create(req, res) {
    //Validte received data to create a new user
    const { error } = this.validateTransaction(req.body);
    if (error) return res.status(400).send(error.message);
    //Find the authorized user
    const user = await this.User.findOne({ where: { id: req.user.id } });
    //Find the used account for transaction
    const usedAccount = await this.Account.findOne({
      where: {
        userId: user.id,
        name: req.body.account,
      },
    });
    //Find the used category for transaction
    const usedCategory = await this.Category.findOne({
      where: { name: req.body.category },
    });
    console.log(usedAccount.name);
    //Create a new user with given data
    const { type, account, categoryId, amount, note, description, date } =
      req.body;
    const transaction = await this.Transaction.create({
      accountId: usedAccount.id,
      categoryId: usedCategory.id,
      type: type,
      note: note,
      date: date,
      amount: amount,
      userId: user.id,
      description: description,
    });
    return res.status(200).send(transaction);
  }

  //
  async update(req, res) {
    //Look up for the user by given id
    const transaction = await this.Transaction.findOne({
      id: `${parseInt(req.params.id)}`,
    });
    if (!transaction) return res.status(404).send("The user was not found");
    //Validate received data to update a user
    const { error } = this.validateTransaction(req.body);
    if (error) return res.status(400).send(error.message);
    //Update user with sent data
    transaction.amount = req.body.amount;
    res.send(transaction);
  }

  async delete(req, res) {
    //Look up for the user by given id
    const transaction = this.Transaction.findOne({
      id: `${parseInt(req.params.id)}`,
    });
    if (!transaction) return res.status(404).send("The user was not found");
    //Delete a user
    const deletedTransaction = await this.Transaction.destroy({
      id: `${parseInt(req.params.id)}`,
    });
    //Send deleted user to client
    res.send(deletedTransaction);
  }

  //ok
  async getOne(req, res) {
    //Look up for the user by given id
    const transaction = await this.Transaction.findOne({
      where: { id: req.params.id },
    });
    if (!transaction)
      return res.status(404).send("The transaction was not found");
    res.send(transaction);
  }

  //** OK **//
  async getAll(req, res) {
    //Find the authorized user
    const user = await this.User.findOne({ where: { id: req.user.id } });
    const allTransactions = await this.Transaction.findAll({
      where: { userId: user.id },
    });
    return res.status(200).send(allTransactions);
  }
}

module.exports = TransactionController;
