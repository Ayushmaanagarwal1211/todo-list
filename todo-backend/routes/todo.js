// import express from "express";

const express = require("express");
const router = express()
const Todo = require("../models/todo")
router.post("/", async (req, res) => {
    const { title, description, category, deadline, status } = req.body;
    const newTodo = new Todo({ userId: req.auth.userId, title, description, category, deadline, status });
    await newTodo.save();
    res.status(201).json(newTodo);
  
});

// Get all Todos for a user
router.get("/", async (req, res) => {
    // res.setHeader("Cache-Control", "public, max-age=31536000, must-revalidate");
    const todos = await Todo.find({ userId: req.auth.userId });
    res.setHeader("Cache-Control", "private, max-age=60, must-revalidate");
    res.json({ todos }); // Send your data
  
});

// Get a single Todo by ID
router.get("/:id", async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.auth.userId });
    if (!todo) return res.status(404).json({ message: "Todo not found" });
    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
