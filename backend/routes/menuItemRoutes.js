const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const MenuItem = require("../models/MenuItem"); // Adjust path as needed
const Eatery = require("../models/Eatery"); // Adjust path as needed

// Add Menu Item
router.post("/add", async (req, res) => {
    try {
        const { eatery, ...rest } = req.body;

        if (!eatery || !eatery.eateryId) {
            return res.status(400).json({ error: "Eatery must have an eateryId" });
        }

        if (!mongoose.Types.ObjectId.isValid(eatery.eateryId)) {
            return res.status(400).json({ error: "Invalid eateryId" });
        }

        const existingEatery = await Eatery.findById(eatery.eateryId);
        if (!existingEatery) {
            return res.status(404).json({ error: "Eatery not found" });
        }

        if (eatery.eateryName !== existingEatery.name) {
            return res.status(400).json({ error: "Eatery name does not match the provided eateryId" });
        }

        const newItem = new MenuItem({ eatery, ...rest });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Other routes below...

router.post("/", async (req, res) => {
    try {
        const { eatery, ...rest } = req.body;

        if (!eatery || !eatery.eateryId) {
            return res.status(400).json({ error: "Eatery must have an eateryId" });
        }

        if (!mongoose.Types.ObjectId.isValid(eatery.eateryId)) {
            return res.status(400).json({ error: "Invalid eateryId" });
        }

        const existingEatery = await Eatery.findById(eatery.eateryId);
        if (!existingEatery) {
            return res.status(404).json({ error: "Eatery not found" });
        }

        if (eatery.eateryName !== existingEatery.name) {
            return res.status(400).json({ error: "Eatery name does not match the provided eateryId" });
        }

        const menuItem = new MenuItem({ eatery, ...rest });
        await menuItem.save();

        res.status(201).json(menuItem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// All your existing GET, PUT, PATCH, DELETE routes (unchanged)
router.get("/", async (req, res) => {
    try {
        const menuItems = await MenuItem.find();
        res.json(menuItems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/eatery/:eateryId", async (req, res) => {
    try {
        const { eateryId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(eateryId)) {
            return res.status(400).json({ error: "Invalid eateryId" });
        }

        const menuItems = await MenuItem.find({ "eatery.eateryId": eateryId });
        res.json(menuItems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/eatery-name/:eateryName", async (req, res) => {
    try {
        const menuItems = await MenuItem.find({ 
            "eatery.eateryName": { $regex: new RegExp("^" + req.params.eateryName + "$", "i") }
        });

        if (!menuItems.length) {
            return res.status(404).json({ message: "No menu items found for this eatery" });
        }

        res.json(menuItems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/filter", async (req, res) => {
    try {
        const { eateryName, cuisineType, dietaryPreferences, allergens } = req.query;
        const filter = {};

        if (eateryName) filter["eatery.eateryName"] = eateryName;
        if (cuisineType) filter.cuisineType = cuisineType;
        if (dietaryPreferences) {
            filter.dietaryPreferences = { $all: dietaryPreferences.split(",") };
        }
        if (allergens) {
            filter.allergens = { $nin: allergens.split(",") };
        }

        const menuItems = await MenuItem.find(filter);
        if (!menuItems.length) {
            return res.status(404).json({ message: "No matching menu items found" });
        }

        res.json(menuItems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/search", async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ error: "Please provide a search term" });
        }

        const menuItems = await MenuItem.find({ name: { $regex: name, $options: "i" } });

        if (!menuItems.length) {
            return res.status(404).json({ message: "No matching menu items found" });
        }

        res.json(menuItems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid menu item ID" });
        }

        const menuItem = await MenuItem.findById(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }
        res.json(menuItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid menu item ID" });
        }

        const { eatery, ...rest } = req.body;

        if (eatery && !mongoose.Types.ObjectId.isValid(eatery.eateryId)) {
            return res.status(400).json({ error: "Invalid eateryId" });
        }

        const updatedMenuItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            { eatery, ...rest },
            { new: true, runValidators: true }
        );

        if (!updatedMenuItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }

        res.json(updatedMenuItem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid menu item ID" });
        }

        const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);
        if (!deletedItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }
        res.json({ message: "Menu item deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch("/:id/availability", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid menu item ID" });
        }

        const { availability } = req.body;

        if (availability === undefined) {
            return res.status(400).json({ error: "Availability status is required" });
        }

        const updatedMenuItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            { availability },
            { new: true }
        );

        if (!updatedMenuItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }

        res.json(updatedMenuItem);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
