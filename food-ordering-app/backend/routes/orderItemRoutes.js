const express = require('express');
const router = express.Router();
const OrderItem = require('../models/OrderItem');

//  Create a new order item
router.post('/', async (req, res) => {
    try {
        const orderItem = new OrderItem(req.body);
        await orderItem.save();
        res.status(201).json(orderItem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

//  Get all order items
router.get('/', async (req, res) => {
    try {
        const orderItems = await OrderItem.find().populate('menuItem');
        res.json(orderItems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//  Delete order item
router.delete('/:id', async (req, res) => {
    try {
        await OrderItem.findByIdAndDelete(req.params.id);
        res.json({ message: 'Order item deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
