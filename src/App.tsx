"use client"

import { BrowserRouter as Router, Routes, Route } from "react-router"
import { useEffect } from "react"
import { ThemeProvider } from "./context/ThemeContext"
import { ScrollToTop } from "./components/common/ScrollToTop"
import SignIn from "./pages/AuthPages/SignIn"
import LineChart from "./pages/Charts/LineChart"
import BarChart from "./pages/Charts/MonthlyOrderStatistics"
import AppLayout from "./layout/AppLayout"
import Home from "./pages/Dashboard/Home"
import Books from "./pages/BooksPage/Books"
import Auther from "./pages/BooksPage/Auther"
import Kafedra from "./pages/UsersPage/Kafedra"
import Direction from "./pages/UsersPage/Direction"
import StudentGroup from "./pages/UsersPage/StudentGroup"
import UsersAll from "./pages/UsersPage/UsersAll"
import NotFound from "./pages/NotFound/NotFound"
import Category from "./pages/BooksPage/Category"
import Languages from "./pages/BooksPage/Languages"
import Alphabet from "./pages/BooksPage/Alphabet"
import Admins from "./pages/Admins/Admins"
import Status from "./pages/BooksPage/Status"
import CreateBooks from "./pages/BooksPage/CreateBooks"
import Roles from "./pages/Admins/Roles"
import ProtectedRoute from "./components/common/ProtectedRoute"
import Order from "./pages/OrderDetails/Order"
import PermissionGroup from "./pages/Admins/PermissionGroup"
import Permission from "./pages/Admins/Permission"
import History from "./pages/OrderDetails/History"
import UsersBuild from "./pages/Admins/UsersBuild"
import BookItem from "./pages/BooksPage/BookItem"
import BlackList from "./pages/OrderDetails/BlackList"
import Direktor from "./pages/OrderDetails/Direktor"

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark")
  }, [])

  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/signin" element={<SignIn />} />

          {/* Protected routes - AppLayout ham himoyalangan */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="admins" element={<Admins />} />
            <Route path="auther" element={<Auther />} />
            <Route path="categories" element={<Category />} />
            <Route path="languages" element={<Languages />} />
            <Route path="alphabet" element={<Alphabet />} />
            <Route path="status" element={<Status />} />
            <Route path="books-all" element={<Books />} />
            <Route path="book-create" element={<CreateBooks />} />
            <Route path="kafedra" element={<Kafedra />} />
            <Route path="direction" element={<Direction />} />
            <Route path="student_group" element={<StudentGroup />} />
            <Route path="line-chart" element={<LineChart />} />
            <Route path="bar-chart" element={<BarChart />} />
            <Route path="users-all" element={<UsersAll />} />
            <Route path="roles" element={<Roles />} />
            <Route path="roles/:id" element={<PermissionGroup />} />
            <Route path="order" element={<Order />} />
            <Route path="permission-create" element={<Permission />} />
            <Route path="black-list" element={<History />} />
            <Route path="users-build" element={<UsersBuild />} />
            <Route path="books-detail" element={<BookItem />} />
            <Route path="decanat" element={<BlackList />} />
            <Route path="direktor" element={<Direktor />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}