const Ingredient = require("../models/Ingredient");
const Recipe = require("../models/Recipe");
const User = require("../models/User");

const RecipeController = {
  async create(req, res, next) {
    try {
      const recipe = await Recipe.create({
        ...req.body,
        userId: req.user._id,
      });
      await User.findByIdAndUpdate(
        req.user._id,
        { $push: { recipeIds: recipe._id } },
        { new: true }
      );
      if (recipe.ingredients && recipe.ingredients.length > 0) {
        const ingredientIds = recipe.ingredients.map((ingredient) => ingredient.ingredient);
        await Ingredient.updateMany(
          { _id: { $in: ingredientIds } },
          { $push: { recipeIds: recipe._id } }
        );
      }
      res.status(201).send(recipe);
    } catch (error) {
      console.error(error);
      next(error);
    }
  },

  async update(req, res) {
    try {
      const { _id, ingredients } = req.body;
      const recipe = await Recipe.findByIdAndUpdate(req.params._id, req.body, {
        new: true,
      });
      if (ingredients && ingredients.length > 0) {
        const oldIngredientIds = ingredients.map((ingredient) => ingredient.oldIngredientId).filter(Boolean);
        const newIngredientIds = ingredients.map((ingredient) => ingredient.ingredient).filter(Boolean);

        await Ingredient.updateMany(
          { _id: { $in: oldIngredientIds } },
          { $pull: { recipeIds: _id } }
        );

        await Ingredient.updateMany(
          { _id: { $in: newIngredientIds } },
          { $push: { recipeIds: _id } }
        );
      }
      res.send({ message: "Recipe updated successfully!", recipe });
    } catch (error) {
      console.error(error);
    }
  },

  async delete(req, res) {
    try {
      await Recipe.findByIdAndDelete(req.params._id);
      await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { recipeIds: req.params._id } },
        { new: true }
      );
      res.send({ message: "Recipe deleted succesfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error trying to remove the recipe" });
    }
  },

  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 30 } = req.query;
      const recipes = await Recipe.find({})
        .populate({
          path: "userId",
          select: "firstName lastName email",
        })
        // .populate({
        //   path: "ingredients.ingredient",
        //   select: "product",
        // })
        .limit(limit)
        .skip((page - 1) * limit);
      res.status(200).send(recipes);
    } catch (error) {
      console.error(error);
      next(error);
    }
  },

  async getById(req, res) {
    try {
      const recipe = await Recipe.findById(req.params._id)
        .populate({ path: 'userId', select: "firstName lastName" })
        .populate({ path: "ingredients.ingredient", select: "ingredientName" })
      res.send(recipe);
    } catch (error) {
      console.error(error);
    }
  },

  async getByName(req, res) {
    try {
      if (req.params.name.length > 20) {
        return res.status(400).send("Search too long");
      }
      const title = new RegExp(req.params.name, "i");
      const recipe = await Recipe.find({ title });
      res.send(recipe);
    } catch (error) {
      console.log(error);
    }
  },

};

module.exports = RecipeController;