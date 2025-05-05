const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Eatery = require("../models/Eatery");
const Review = require("../models/Review"); 


const upload = multer({ dest: "uploads/" }); 

router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "Image is required" });

        const eatery = new Eatery({
            name: req.body.name,
            location: req.body.location,
            contactInfo: req.body.contactInfo,
            openingHours: req.body.openingHours,
            owner: req.body.owner,
            phoneNumber: req.body.phoneNumber,
            image: {
                data: fs.readFileSync(req.file.path),
                contentType: req.file.mimetype
            }
        });

        await eatery.save();
        fs.unlinkSync(req.file.path); // Clean up

        res.status(201).json(eatery);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /eateries/by-owner/:ownerId
// GET /eateries/by-owner/:ownerId
router.get('/by-owner/:ownerId', async (req, res) => {
    try {
        const { ownerId } = req.params;

        // Find the eatery by the owner's ID, and select both the _id and name
        const eatery = await Eatery.findOne({ owner: ownerId }).select('_id name');

        if (!eatery) {
            return res.status(404).json({ error: 'Eatery not found for this owner' });
        }

        // Return both the eateryId and eateryName
        res.json({ eateryId: eatery._id, eateryName: eatery.name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const eateries = await Eatery.find(); // Do not use .select to exclude image fields
        res.json(eateries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const eatery = await Eatery.findById(req.params.id);
        if (!eatery) return res.status(404).json({ error: 'Eatery not found' });
        res.json(eatery);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



router.get('/:id/image', async (req, res) => {
    try {
        const eatery = await Eatery.findById(req.params.id);
        
        // Ensure that the eatery and image exist
        if (!eatery || !eatery.image || !eatery.image.data) {
            return res.status(404).send("Image not found");
        }

        // Set the correct content type for the image
        res.contentType(eatery.image.contentType);
        
        // Send the image data
        res.send(eatery.image.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const updateData = {
            name: req.body.name,
            location: req.body.location,
            contactInfo: req.body.contactInfo,
            openingHours: req.body.openingHours,
            owner: req.body.owner,
            phoneNumber: req.body.phoneNumber
        };

        if (req.file) {
            updateData.image = {
                data: fs.readFileSync(req.file.path),
                contentType: req.file.mimetype
            };
            fs.unlinkSync(req.file.path);
        }

        const updatedEatery = await Eatery.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedEatery);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Eatery.findByIdAndDelete(req.params.id);
        res.json({ message: 'Eatery deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// POST: Add a review to a specific eatery
router.post('/:id/reviews', async (req, res) => {
    try {
        const { userId, userName, rating, reviewText } = req.body;

        const eatery = await Eatery.findById(req.params.id);
        if (!eatery) return res.status(404).json({ error: "Eatery not found" });

        const review = new Review({
            eatery: req.params.id,
            user: userId,
            userName,
            rating,
            reviewText
        });

        await review.save();

        // Update eatery stats
        const reviews = await Review.find({ eatery: req.params.id });

        const totalRatings = reviews.length;
        const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

        const ratingsBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(r => ratingsBreakdown[r.rating]++);

        await Eatery.findByIdAndUpdate(req.params.id, {
            averageRating,
            totalRatings,
            ratingsBreakdown
        });

        res.status(201).json({ message: "Review added" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// // GET: Get all reviews for a specific eatery
// router.get('/:id/reviews', async (req, res) => {
//     try {
//         const reviews = await Review.find({ eatery: req.params.id }).sort({ createdAt: -1 });
//         res.json(reviews);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// GET: Get the name of an eatery by ID
router.get('/:id/name', async (req, res) => {
    try {
        const eatery = await Eatery.findById(req.params.id).select('name'); // Select only the 'name' field
        if (!eatery) return res.status(404).json({ error: 'Eatery not found' });
        res.json({ name: eatery.name }); // Return only the name of the eatery
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ eatery: req.params.id }).sort({ createdAt: -1 });

        if (reviews.length === 0) {
            return res.json({
                averageRating: 0,
                totalReviews: 0,
                ratingsBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                reviews: []
            });
        }

        const totalReviews = reviews.length;

        const sumRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = parseFloat((sumRatings / totalReviews).toFixed(1)); // Rounded to 1 decimal

        const ratingsBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(r => {
            ratingsBreakdown[r.rating] = (ratingsBreakdown[r.rating] || 0) + 1;
        });

        const formattedReviews = reviews.map(r => ({
            userName: r.userName,
            rating: r.rating,
            comment: r.reviewText,
            createdAt: r.createdAt
        }));

        res.json({
            averageRating,
            totalReviews,
            ratingsBreakdown,
            reviews: formattedReviews
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



module.exports = router;
