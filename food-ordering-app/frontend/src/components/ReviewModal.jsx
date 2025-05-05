"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/ReviewModal.css";
import { eateryRoute } from "../constant";

const ReviewModal = ({ isOpen, onClose, restaurantName = "BOB" }) => {
  const { eateryId } = useParams();
  const navigate = useNavigate();

  const [reviewsData, setReviewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("top");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${eateryRoute}/${eateryId}/reviews`);
        console.log("API Response:", response.data);
        setReviewsData(response.data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Error fetching reviews");
      } finally {
        setLoading(false);
      }
    };

    if (eateryId) {
      fetchReviews();
    }
  }, [eateryId]);

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const handleClose = () => {
    console.log("Closing and navigating to eatery page:", eateryId);
    onClose();
    navigate(`/eatery/${eateryId}`);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? "filled" : "empty"}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  if (!isOpen) return null;
  if (loading) return <div className="modal-overlay"><div className="review-modal"><p>Loading...</p></div></div>;
  if (error) return <div className="modal-overlay"><div className="review-modal"><p>{error}</p></div></div>;
  if (!reviewsData) return null;

  const { averageRating, ratingsBreakdown, reviews, totalReviews } = reviewsData;

  return (
    <div className="modal-overlay">
      <div className="review-modal">
        <div className="modal-header">
          <div>
            <h2>Reviews</h2>
            <h3>{restaurantName}</h3>
          </div>
          <button className="close-button" onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className="modal-content">
          <div className="rating-summary">
            <div className="overall-rating">
              <h1>{averageRating.toFixed(1)}</h1>
              <div className="stars-container">{renderStars(Math.round(averageRating))}</div>
              <p>All Ratings ({totalReviews})</p>
            </div>

            <div className="rating-breakdown">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingsBreakdown[rating] || 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={rating} className="rating-bar">
                    <span className="rating-number">{rating}</span>
                    <span className="star filled">★</span>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${percentage}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* <div className="filter-buttons">
            <button
              className={activeFilter === "top" ? "active" : ""}
              onClick={() => handleFilterClick("top")}
            >
              Top reviews
            </button>
            <button
              className={activeFilter === "newest" ? "active" : ""}
              onClick={() => handleFilterClick("newest")}
            >
              Newest
            </button>
            <button
              className={activeFilter === "highest" ? "active" : ""}
              onClick={() => handleFilterClick("highest")}
            >
              Highest Rating
            </button>
            <button
              className={activeFilter === "lowest" ? "active" : ""}
              onClick={() => handleFilterClick("lowest")}
            >
              Lowest Rating
            </button>
          </div> */}

          {/* <div className="reviews-scroll-wrapper">
            <div className="reviews-list">
              {reviews.map((review, index) => (
                <div key={index} className="review-item">
                  <div className="reviewer-info">
                    <h4>{review.userName}</h4>
                    <div className="review-stars">
                      {renderStars(review.rating)}
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="review-text">{review.comment || "No comment provided."}</p>
                </div>
              ))}
            </div>
          </div> */}
          <div className="reviews-scroll-wrapper">
  <div className="reviews-list">
    {reviews.length === 0 ? (
      <p>No reviews yet. Be the first to leave a review!</p>
    ) : (
      reviews.map((review, index) => (
        <div key={index} className="review-item">
          <div className="reviewer-info">
            <h4>{review.userName}</h4>
            <div className="review-stars">
              {renderStars(review.rating)}
              <span className="review-date">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <p className="review-text">{review.comment || "No comment provided."}</p>
        </div>
      ))
    )}
  </div>
</div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;


