import { BrowserRouter as Router, Routes, Route } from "react-router"
import { useEffect } from "react"
import { ThemeProvider } from "./context/ThemeContext"
import { ScrollToTop } from "./components/common/ScrollToTop"
import SignIn from "./pages/AuthPages/SignIn"
import AppLayout from "./layout/AppLayout"
import Home from "./pages/Dashboard/Home"
import Books from "./pages/BooksPage/Books"
import Auther from "./pages/BooksPage/Auther"
import Kafedra from "./pages/BooksPage/Kafedra"
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
import YearStatistics from "./pages/Charts/YearlyOrderStatistics"
import MonthStatistics from "./pages/Charts/MonthOrderStatistics"
import WeekStatistics from "./pages/Charts/WeekOrderStatistics"
import DayStatistics from "./pages/Charts/DayOrderStatistics"
import Teacher from "./pages/Admins/Teacher"

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark")
  }, [])

  useEffect(() => {
    const checkFirstVisit = () => {
      try {
        const hasVisitedBefore = sessionStorage.getItem("hasVisitedApp")

        if (!hasVisitedBefore) {
          sessionStorage.setItem("hasVisitedApp", "true")

          setTimeout(() => {
            window.location.reload()
          }, 150)
        }
      } catch (error) {
        console.error("First visit check error:", error)
      }
    }

    if (document.readyState === "complete") {
      checkFirstVisit()
    } else {
      window.addEventListener("load", checkFirstVisit)
      return () => window.removeEventListener("load", checkFirstVisit)
    }
  }, [])

  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            {/* Admin sahifalari */}
            <Route path="admins" element={<Admins />} />
            <Route path="roles" element={<Roles />} />
            <Route path="roles/:id" element={<PermissionGroup />} />
            <Route path="permission-create" element={<Permission />} />
            <Route path="users-build" element={<UsersBuild />} />
            <Route path="teacher-create" element={<Teacher />} />
            {/* Kitoblar bo'limi */}
            <Route path="books-all" element={<Books />} />
            <Route path="book-create" element={<CreateBooks />} />
            <Route path="books-detail" element={<BookItem />} />
            <Route path="auther" element={<Auther />} />
            <Route path="categories" element={<Category />} />
            <Route path="languages" element={<Languages />} />
            <Route path="alphabet" element={<Alphabet />} />
            <Route path="status" element={<Status />} />
            {/* Foydalanuvchilar bo'limi */}
            <Route path="users-all" element={<UsersAll />} />
            <Route path="kafedra" element={<Kafedra />} />
            <Route path="direction" element={<Direction />} />
            <Route path="student_group" element={<StudentGroup />} />
            {/* Buyurtmalar va tarix */}
            <Route path="order" element={<Order />} />
            <Route path="history" element={<History />} />
            <Route path="black-list" element={<BlackList />} />
            <Route path="direktor" element={<Direktor />} />
            {/* Statistika va grafiklar */}
            <Route path="yearly-chart" element={<YearStatistics />} />
            <Route path="monthly-chart" element={<MonthStatistics />} />
            <Route path="weekly-chart" element={<WeekStatistics />} />
            <Route path="daily-chart" element={<DayStatistics />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}