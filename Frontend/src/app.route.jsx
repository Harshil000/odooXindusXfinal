import { createBrowserRouter } from "react-router-dom";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Public from "./shared/Public";
import Private from "./shared/Private";
import App from "./App";
import Orders from "./features/order/pages/Orders";
import Payment from "./features/payment/pages/Payment";
import Customers from "./features/customer/pages/Customers";
import ProductsLayout from "./features/product/pages/ProductsLayout";
import ProductList from "./features/product/pages/ProductList";
import ProductForm from "./features/product/pages/ProductForm";
import ProductCategories from "./features/product/pages/ProductCategories";
import Categories from "./features/category/pages/Categories";
import PrivateLayout from "./shared/PrivateLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Private>
        <PrivateLayout />
      </Private>
    ),
    children: [
      {
        index: true,
        element: <App />,
      },
      {
        path: "orders",
        element: <Orders />,
      },
      {
        path: "payment",
        element: <Payment />,
      },
      {
        path: "customers",
        element: <Customers />,
      },
      {
        path: "products",
        element: <ProductsLayout />,
        children: [
          { index: true, element: <ProductList /> },
          { path: "new", element: <ProductForm /> },
          { path: "categories", element: <ProductCategories /> },
        ],
      },
      {
        path: "categories",
        element: <Categories />,
      },
      {
        path: "reporting",
        element: <App />,
      },
    ],
  },
  {
    path: "/login",
    element: (
      <Public>
        <Login />
      </Public>
    ),
  },
  {
    path: "/register",
    element: (
      <Public>
        <Register />
      </Public>
    ),
  },
]);

export default router;
