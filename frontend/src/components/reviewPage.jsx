import { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Import useParams to extract parameters from URL
import ReviewModal from "./ReviewModal";
import { eateryRoute } from "../constant";

const ReviewPage = () => {
  const { eateryId } = useParams(); // Extract eateryId from the URL
  const [isOpen, setIsOpen] = useState(true);
  const [restaurantName, setRestaurantName] = useState(""); // State to store the restaurant name

  // Fetch the eatery name when the component mounts
  useEffect(() => {
    const fetchEateryName = async () => {
      try {
        const response = await fetch(`${eateryRoute}/${eateryId}/name`);
        if (!response.ok) {
          throw new Error('Eatery not found');
        }
        const data = await response.json();
        setRestaurantName(data.name); // Set the restaurant name from the response
      } catch (error) {
        console.error('Error fetching eatery name:', error);
      }
    };

    if (eateryId) {
      fetchEateryName(); // Call API to get eatery name
    }
  }, [eateryId]); // Re-run the effect when eateryId changes

  console.log("Eatery ID:", eateryId);
  console.log("Restaurant Name:", restaurantName);

  return (
    <div>
      {/* Pass eateryId and restaurantName as props to ReviewModal */}
      <ReviewModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        restaurantName={restaurantName}  // Pass the dynamically fetched restaurant name
        eateryId={eateryId}  // Pass eateryId dynamically
      />
    </div>
  );
};

export default ReviewPage;




// import { useState, useEffect } from "react";
// import { useParams } from "react-router-dom"; // Import useParams to extract parameters from URL
// import ReviewModal from "./ReviewModal";

// const ReviewPage = () => {
//   const [isOpen, setIsOpen] = useState(true);

//   // Extract eateryId from the URL
//   const { eateryId } = useParams();
  
//   // Here we use a hardcoded restaurant name, but you could dynamically fetch it if needed.
//   const restaurantName = "BOBBYYY"; // You can replace this with logic to dynamically fetch the name if needed

//   console.log("Eatery ID:", eateryId);
//   console.log("Restaurant Name:", restaurantName);

//   return (
//     <div>
//       {/* Pass eateryId and restaurantName as props to ReviewModal */}
//       <ReviewModal
//         isOpen={isOpen}
//         onClose={() => setIsOpen(false)}
//         restaurantName={restaurantName}  // Pass restaurant name dynamically
//         eateryId={eateryId}  // Pass eateryId dynamically
//       />
//     </div>
//   );
// };

// export default ReviewPage;


