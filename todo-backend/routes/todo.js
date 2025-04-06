const express = require("express");
const router = express()
const Todo = require("../models/todo")
router.post("/", async (req, res) => {
    const { title, description, category, deadline, status } = req.body;
    const newTodo = new Todo({ userId: req.auth.userId, title, description, category, deadline, status });
    await newTodo.save();
    res.status(201).json(newTodo);
  
});

router.get("/", async (req, res) => {
    const todos = await Todo.find({ userId: req.auth.userId });
    res.setHeader("Cache-Control", "private, max-age=60, must-revalidate");
    res.json({ todos }); 
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
