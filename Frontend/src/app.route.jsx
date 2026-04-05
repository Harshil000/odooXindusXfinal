import { createBrowserRouter } from "react-router-dom";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Session from "./features/session/pages/Session";
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
import Setting from "./features/setting/pages/Setting";
import Kitchen from "./features/kitchen/pages/Kitchen";
import CustomerDisplay from "./features/customerDisplay/pages/CustomerDisplay";
import TrackOrder from "./features/customerView/pages/TrackOrder";
import Terminal from "./features/terminal/pages/Terminal";
import OwnerOnly from "./shared/OwnerOnly";
import Profile from "./features/profile/pages/Profile";

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
        element: <Session />,
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
        path: "settings",
        element: (
          <OwnerOnly>
            <Setting />
          </OwnerOnly>
        ),
      },
      {
        path: "profile",
        element: <Profile />,
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
      {
        path: "kitchen",
        element: <Kitchen />,
      },
      {
        path: "terminal",
        element: <Terminal />,
      },
      {
        path: "customer-display",
        element: <CustomerDisplay />,
      },
    ],
  },
  {
    path: "/track/:token",
    element: <TrackOrder />,
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
