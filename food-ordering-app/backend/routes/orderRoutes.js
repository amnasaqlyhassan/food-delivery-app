const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const MenuItem = require("../models/MenuItem");

const Eatery = require("../models/Eatery");
const Cart = require("../models/Cart");

const authMiddleware = require("../middleware/authMiddleware");

// Create a new order
router.post("/", async (req, res) => {
  try {
    const order = new Order(req.body); // Create a new order from request data
    await order.save(); // Save order to database
    res.status(201).json(order); // Return the created order
  } catch (err) {
    res.status(400).json({ error: err.message }); // Handle errors
  }
});

router.get('/eatery/:eateryId', async (req, res) => {
  const eateryId = req.params.eateryId;

  try {
    // Fetch all orders that belong to the specific eatery
    const orders = await Order.find({ eatery: eateryId })
      .populate('user', 'name email') // Populate user info if needed
      .populate('orderItems') // Populate order items if needed
      .exec();

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this eatery.' });
    }

    // Return the orders
    return res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Get all orders
router.get("/", async (req, res) => {
  try {
    const { status } = req.query; // Get the status from query params
    const filter = status ? { status } : {}; // Apply filter if status is provided

    const orders = await Order.find(filter)
      .populate("user")
      .populate("orderItems");

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get order by ID
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user").populate("orderItems");
    if (!order) return res.status(404).json({ message: "Order not found" }); // Check if order exists
    res.json(order); // Return order details
  } catch (err) {
    res.status(500).json({ error: err.message }); // Handle errors
  }
});

// Delete order
router.delete("/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" }); // Confirm deletion
  } catch (err) {
    res.status(500).json({ error: err.message }); // Handle errors
  }
});

// Add item to cart
router.post("/cart/add", async (req, res) => {
  try {
    const { userId, itemId, quantity } = req.body;
    const menuItem = await MenuItem.findById(itemId);

    if (!menuItem) return res.status(404).json({ message: "Menu item not found" });

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex((item) => item.item.toString() === itemId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ item: itemId, quantity });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/cart/remove", async (req, res) => {
  try {
    const { userId, itemId, quantity } = req.body; // Get quantity to remove
    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Find the item in cart
    const itemIndex = cart.items.findIndex((item) => item.item.toString() === itemId);

    if (itemIndex > -1) {
      // Reduce the quantity
      cart.items[itemIndex].quantity -= quantity;

      // If quantity is 0 or negative, remove the item
      if (cart.items[itemIndex].quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      }
    } else {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // If cart is empty after removal, delete the cart
    if (cart.items.length === 0) {
      await Cart.findOneAndDelete({ user: userId });
      return res.json({ message: "Cart is empty and deleted" });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/checkout", async (req, res) => {

  const { userId } = req.body;

  try {
    // Find the cart for the user and populate the items and eatery
    const cart = await Cart.findOne({ user: userId })
      .populate("items.item")  // Populate the item (menu item)
      .populate("items.item.eatery");  // Populate the eatery inside each item

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty or not found." });
    }

    // Check if each item is populated correctly
    const hasValidItems = cart.items.every(cartItem => cartItem.item !== null && cartItem.item !== undefined);
    if (!hasValidItems) {
      return res.status(400).json({ message: "Some items are missing or invalid." });
    }

    const eateryIds = new Set(
      cart.items.map(cartItem => {

        if (cartItem.item && cartItem.item.eatery) {
          return cartItem.item.eatery.eateryId.toString(); // Use eateryId instead of _id
        } else {
          return null;
        }
      }).filter(eateryId => eateryId !== null)  // Filter out null values
    );

    if (eateryIds.size > 1) {
      return res.status(400).json({
        message: "You can only place an order from one eatery at a time."
      });
    }
    const eateryId = [...eateryIds][0];

    // Create a new order with the user's info and eateryId
    const order = new Order({
      user: userId,
      eatery: eateryId,
      orderItems: [],
      totalPrice: 0,
      status: "pending",
    });

    await order.save(); // Save the order to get the order._id

    const orderItems = await Promise.all(
      cart.items.map(async (cartItem) => {
        const orderItem = new OrderItem({
          item: cartItem.item._id,  // Now cartItem.item is a populated MenuItem, so it's safe to access _id
          quantity: cartItem.quantity,
          subtotalPrice: cartItem.item.price * cartItem.quantity,
          order: order._id, // Link OrderItem to the Order
        });
        await orderItem.save();
        return orderItem;
      })
    );

    order.orderItems = orderItems.map(oi => oi._id);
    order.totalPrice = orderItems.reduce((sum, item) => sum + item.subtotalPrice, 0);
    await order.save(); // Save the updated order

    // Clear the user's cart
    await Cart.findOneAndDelete({ user: userId });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get personalized food recommendations based on order history
router.get("/recommendations/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate("orderItems");

    if (!orders.length) {
      return res.json({ message: "No orders found for recommendations." });
    }

    // Count occurrences of each menu item
    const itemCount = new Map();

    for (const order of orders) {
      for (const orderItemId of order.orderItems) {
        const orderItem = await OrderItem.findById(orderItemId).populate("item");
        if (orderItem && orderItem.item) {
          const itemId = orderItem.item._id.toString();
          itemCount.set(itemId, (itemCount.get(itemId) || 0) + orderItem.quantity);
        }
      }
    }

    const topItems = [...itemCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([itemId, count]) => itemId);

    const recommendedItems = await MenuItem.find({ _id: { $in: topItems } });

    res.json({ recommendations: recommendedItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all orders for a specific user (Order History)
router.post("/user/history", async (req, res) => {
  try {
    const { userId } = req.body;  

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Find the orders for the specified userId
    const userOrders = await Order.find({ user: userId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .populate("orderItems")
      .populate({
        path: "orderItems",
        populate: {
          path: "item",
          model: "MenuItem"
        }
      })
      .populate("eatery");

    if (!userOrders) {
      return res.status(404).json({ error: 'No orders found for this user' });
    }

    res.json(userOrders);  
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Update order status (Only eatery or admin)
router.put("/:orderId/eatery/status", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, userId, role } = req.body;

    const allowedStatuses = ["pending", "preparing", "out_for_delivery", "delivered", "completed", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const order = await Order.findById(orderId).populate("eatery");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Simple role check
    let isAuthorized = false;

    if (role === "admin") {
      isAuthorized = true;
    } else if (role === "owner") {
      const eatery = await Eatery.findOne({ owner: userId });
      if (eatery && order.eatery && eatery._id.equals(order.eatery._id)) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ error: "Access denied. You are not allowed to update this order." });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: "Order status updated successfully", order });
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;