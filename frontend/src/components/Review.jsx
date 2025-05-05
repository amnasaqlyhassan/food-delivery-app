import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar";
import axios from "axios";
import useAuthStore from "./authStore";
import "../styles/review_style.css"; // Make sure you include the CSS
import { eateryRoute } from "../constant";

const ReviewForm = () => {
  const [showNavbar, setShowNavbar] = useState(true);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [restaurantName, setRestaurantName] = useState(""); // Add name state
  const [successMessage, setSuccessMessage] = useState(""); // State for success message

  const { user } = useAuthStore();
  const { eateryId } = useParams(); // Get eateryId from URL

  useEffect(() => {
    const fetchEateryName = async () => {
      try {
        const res = await fetch(`${eateryRoute}/${eateryId}/name`);
        const data = await res.json();
        setRestaurantName(data.name);
      } catch (err) {
        console.error("Error fetching eatery name:", err);
      }
    };

    if (eateryId) fetchEateryName();
  }, [eateryId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${eateryRoute}/${eateryId}/reviews`, {
        userId: user._id,
        userName: user.name,
        rating,
        reviewText,
      });

      setSuccessMessage("Thank you! Your review has been submitted.");
      setReviewText("");
      setRating(5);
    } catch (err) {
      setSuccessMessage("Oops! Something went wrong. Please try again.");
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="p-4">
        <div className="rev-hero-box mb-6">
          <h1>Hello, {user?.name?.split(" ")[0]}! 👋</h1>
          <p>
            Would you like to leave a review for{" "}
            <span className="rev-restaurant-name">{restaurantName}</span>?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rev-review-form">
          <p className="rev-review-form-title">Leave a Review</p>

          <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>
                {r} Star{r > 1 ? "s" : ""}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Write your review..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
            required
          />

          <button type="submit">Submit Review</button>
        </form>

        {/* Success message */}
        {successMessage && (
          <div className="success-message">
            <p>{successMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewForm;
