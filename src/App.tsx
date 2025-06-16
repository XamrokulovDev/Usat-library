import { BrowserRouter as Router, Routes, Route } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";
import SignIn from "./pages/AuthPages/SignIn";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Dashboard/Home";
import Books from "./pages/BooksPage/Books";
import Auther from "./pages/BooksPage/Auther";
import Kafedra from "./pages/UsersPage/Kafedra";
import Direction from "./pages/UsersPage/Direction";
import StudentGroup from "./pages/UsersPage/StudentGroup";
import UsersAll from "./pages/UsersPage/UsersAll";
import NotFound from "./pages/NotFound/NotFound";
import Category from "./pages/BooksPage/Category";
import Languages from "./pages/BooksPage/Languages";
import Alphabet from "./pages/BooksPage/Alphabet";
import Admins from "./pages/Admins/Admins";
import Status from "./pages/BooksPage/Status";
import CreateBooks from "./pages/BooksPage/CreateBooks";
import Roles from "./pages/Admins/Roles";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Order from "./pages/OrderDetails/Order";
import PermissionGroup from "./pages/Admins/PermissionGroup";
import Permission from "./pages/Admins/Permission";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route element={<AppLayout />}>
            <Route index path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/admins" element={<ProtectedRoute><Admins /></ProtectedRoute>} />
            <Route path="/auther" element={<ProtectedRoute><Auther /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><Category /></ProtectedRoute>} />
            <Route path="/languages" element={<ProtectedRoute><Languages /></ProtectedRoute>} />
            <Route path="/alphabet" element={<ProtectedRoute><Alphabet /></ProtectedRoute>} />
            <Route path="/status" element={<ProtectedRoute><Status /></ProtectedRoute>} />
            <Route path="/books-all" element={<ProtectedRoute><Books /></ProtectedRoute>} />
            <Route path="/book-create" element={<ProtectedRoute><CreateBooks /></ProtectedRoute>} />
            <Route path="/kafedra" element={<ProtectedRoute><Kafedra /></ProtectedRoute>} />
            <Route path="/direction" element={<ProtectedRoute><Direction /></ProtectedRoute>} />
            <Route path="/student_group" element={<ProtectedRoute><StudentGroup /></ProtectedRoute>} />
            <Route path="/line-chart" element={<ProtectedRoute><LineChart /></ProtectedRoute>} />
            <Route path="/bar-chart" element={<ProtectedRoute><BarChart /></ProtectedRoute>} />
            <Route path="/users-all" element={<ProtectedRoute><UsersAll /></ProtectedRoute>} />
            <Route path="/roles" element={<ProtectedRoute><Roles /></ProtectedRoute>} />
            <Route path="/roles/:id" element={<ProtectedRoute><PermissionGroup /></ProtectedRoute>} />
            <Route path="/order" element={<ProtectedRoute><Order /></ProtectedRoute>}/>
            <Route path="/permission-create" element={<ProtectedRoute><Permission /></ProtectedRoute>}/>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}