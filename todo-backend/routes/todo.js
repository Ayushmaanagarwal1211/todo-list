const express = require("express");
const router = express()
const Todo = require("../models/todo")


router.get("/tags/all", async (req, res) => {
  try {
    const userId = req.auth.userId;

    const result = await Todo.aggregate([
      { $match: { userId } },
      { $unwind: "$tags" },
      { $group: { _id: null, uniqueTags: { $addToSet: "$tags" } } },
      { $project: { _id: 0, tags: "$uniqueTags" } },
    ]);

    const tags = result[0]?.tags || [];
    console.log(tags)
    res.status(200).json({ tags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
});



router.post("/", async (req, res) => {
  try{
    const { title, description, category, deadline, status ,tags} = req.body;
    const newTodo = new Todo({ userId: req.auth.userId, title, description, category, deadline, status,tags });
    const data = await newTodo.save();
    return res.status(201).json(newTodo);
  }catch(err){
    return res.status(500).json({error: err.message});
  }
  
});

router.get("/", async (req, res) => {
  const { limit = 10 } = req.query;
  const { from, to, title, categories, tags } = JSON.parse(req.headers.filters || "{}");

  const filters = {
    userId: req.auth.userId,
  };

  if (title) {
    filters.title = { $regex: title, $options: "i" }; 
  }

  if (Array.isArray(categories) && categories.length > 0) {
    filters.category = { $in: categories };
  }

  if (Array.isArray(tags) && tags.length > 0) {
    filters.tags = { $in: tags };
  }

  const parseDate = (input) => {
    const [day, month, year] = input.split("/");
    return new Date(input);
  };

  if (from && to) {
    const fromDate = parseDate(from);
    const toDate = parseDate(to);

    if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
      filters.deadline = {
        $gte: fromDate,
        $lte: toDate,
      };
    } else {
      return res.status(400).json({ error: "Invalid date format" });
    }
  }

  const skip = (Number(req.query.page) - 1) * Number(limit);

  try {
    const [todos, total] = await Promise.all([
      Todo.find(filters).skip(skip).limit(Number(limit)).sort({ deadline: 1 }),
      Todo.countDocuments(filters),
    ]);

    res.json({
      todos,
      total,
      currentPage: Number(req.query.page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.put("/:id", async (req, res) => {
  try {
    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: req.params.id, userId: req.auth.userId },
      req.body,
      { new: true }
    );
    if (!updatedTodo) return res.status(404).json({ message: "Todo not found" });
    res.status(200).json(updatedTodo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedTodo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.auth.userId });
    if (!deletedTodo) return res.status(404).json({ message: "Todo not found" });
    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = {todoRouter : router}
