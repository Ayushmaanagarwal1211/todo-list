const express = require("express");
const router = express()
const Todo = require("../models/todo")
router.post("/", async (req, res) => {
    const { title, description, category, deadline, status ,tags} = req.body;
    const newTodo = new Todo({ userId: req.auth.userId, title, description, category, deadline, status,tags });
    const data = await newTodo.save();
    console.log(data)
    res.status(201).json(newTodo);
  
});

router.get("/", async (req, res) => {
    const {
      limit = 10,
    } = req.query;
    const {from,to,title,categories,tags} = JSON.parse(req.headers.filters || "{}")
    const filters = {
      userId: req.auth.userId,
    };

    if (title) {
      filters.title = { $regex: title, $options: "i" }; // case-insensitive search
    }

  if (Array.isArray(categories) && categories.length > 0) {
    filters.category = { $in: categories };
  }

   if (Array.isArray(tags) && tags.length > 0) {
    filters.tags = { $in: tags };
  }

    if (from && to) {
      filters.deadline = {};
      filters.deadline.$gte = new Date(from);
      filters.deadline.$lte = new Date(to);
      
    }
    const skip = (Number(req.query.page) - 1) * Number(limit);

    const [todos, total] = await Promise.all([
      Todo.find(filters).skip(skip).limit(Number(limit)).sort({ deadline: 1 }),
      Todo.countDocuments(filters),
    ]);

    res.setHeader("Cache-Control", "private, max-age=60, must-revalidate");
    res.json({
      todos,
      total,
      currentPage: Number(req.query.page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  
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
