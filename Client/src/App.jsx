import { Routes, Route } from 'react-router-dom'
import SharedLayout from './components/Layout/SharedLayout'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './Pages/Home/Home'
import CategoryPage from './Pages/Category/CategoryPage'
import ProductDetail from './Pages/Product/ProductDetail'
import Cart from './Pages/Cart/Cart'
import Checkout from './Pages/Checkout/Checkout'
import Wishlist from './Pages/Wishlist/Wishlist'
import Profile from './Pages/Account/Profile'
import OrderHistory from './Pages/Account/OrderHistory'
import Search from './Pages/Search/Search'
import Support from './Pages/Support/Support'
import Four04 from './Pages/Four04/Four04'
import Login from './Pages/Auth/Login'
import Register from './Pages/Auth/Register'
import ForgotPassword from './Pages/Auth/ForgotPassword'
import ResetPassword from './Pages/Auth/ResetPassword'
import OrderConfirmation from './Pages/Order/OrderConfirmation'

import AdminLogin from './Pages/Admin/AdminLogin'
import AdminDashboard from './Pages/Admin/AdminDashboard'
import AddProduct from './Pages/Admin/AddProduct'
import ProductManager from './Pages/Admin/ProductManager'
import AdminNavManager from './Pages/Admin/AdminNavManager'
import OrderManager from './Pages/Admin/OrderManager'
import CouponManager from './Pages/Admin/CouponManager'
import ReviewModeration from './Pages/Admin/ReviewModeration'
import AdminAnalytics from './Pages/Admin/AdminAnalytics'

export default function App () {
  return (
    <Routes>
      <Route element={<SharedLayout />}>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password/:token' element={<ResetPassword />} />

        <Route path='/:category' element={<CategoryPage />} />
        <Route path='/product/:slug' element={<ProductDetail />} />
        <Route path='/search' element={<Search />} />
        <Route path='/support' element={<Support />} />
        <Route path='/wishlist' element={<Wishlist />} />

        <Route path='/cart' element={<Cart />} />
        <Route
          path='/checkout'
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path='/order-confirmation/:orderId'
          element={
            <ProtectedRoute>
              <OrderConfirmation />
            </ProtectedRoute>
          }
        />

        <Route
          path='/account'
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path='/account/orders'
          element={
            <ProtectedRoute>
              <OrderHistory />
            </ProtectedRoute>
          }
        />

        <Route path='/admin/login' element={<AdminLogin />} />
        <Route
          path='/admin'
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/products'
          element={
            <ProtectedRoute adminOnly>
              <ProductManager />
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/products/new'
          element={
            <ProtectedRoute adminOnly>
              <AddProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/orders'
          element={
            <ProtectedRoute adminOnly>
              <OrderManager />
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/nav'
          element={
            <ProtectedRoute adminOnly>
              <AdminNavManager />
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/coupons'
          element={
            <ProtectedRoute adminOnly>
              <CouponManager />
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/reviews'
          element={
            <ProtectedRoute adminOnly>
              <ReviewModeration />
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/analytics'
          element={
            <ProtectedRoute adminOnly>
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />

        <Route path='*' element={<Four04 />} />
      </Route>
    </Routes>
  )
}
