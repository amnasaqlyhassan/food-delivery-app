import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import ReviewPage from "./components/reviewPage" // import at the top
import Signup from "./components/Signup"
import Login from "./components/Login"
import ChangePassword from "./components/ChangePassword"
import Homepage from "./components/HomePage"
import EateryPage from "./components/EateryPage"
import CategoryPage from "./components/Categories"
import OrderStatus from "./components/OrderStatus"
import Cart from "./components/Checkout"
import EateryHomepage from "./components/EateryHomepage"
import Menu from "./components/Menu"
import ReviewForm from "./components/Review"
import OwnerOrderStatus from "./components/OwnerOrderStatus"
import SearchResults from "./components/SearchResults"
// import OrderHistory from "./components/OrderHistory"

import OrderHistory from "./components/OrderHistory"
import "./styles/signup-style.css"
import "./styles/login-style.css"
import "./styles/change-password-style.css"
import "./styles/navbar.css" // Updated CSS filename
import "./styles/home-page.css" // Updated CSS filename
import "./styles/categories.css" // Updated CSS filename
import "./styles/Checkout_style.css"
import "./styles/eatery-homepage.css"
import "./styles/menu.css"
import "./styles/review_style.css"
import "./styles/search-results.css"
// import "./styles/history_style.css"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} /> {/* Default Route */}
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/home-page" element={<Homepage />} />
        <Route path="/eatery/:eateryId" element={<EateryPage />} /> 
        <Route path="/categories/:categoryName" element={<CategoryPage />} />
        <Route path="/order-status/:orderId" element={<OrderStatus />} />
        <Route path="/eatery-homepage" element={<EateryHomepage />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/checkout" element={<Cart />} />
        <Route path="/reviews" element={<ReviewPage />} />
        <Route path="/history" element={<OrderHistory />} />
        <Route path="/reviews/:eateryId" element={<ReviewPage />} />
        <Route path="/leave-review/:eateryId" element={<ReviewForm />} />
        <Route path="/order-status-owner/:orderId" element={<OwnerOrderStatus />} />
        <Route path="/search-results" element={<SearchResults />} />
      </Routes>
    </Router>
  )
}

export default App

