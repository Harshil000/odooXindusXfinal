import { createBrowserRouter } from "react-router-dom";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Session from "./features/session/pages/Session";
import Public from "./shared/Public";
import Private from "./shared/Private";
import App from "./App";
import Orders from "./features/order/pages/Orders";
import Payment from "./features/payment/pages/Payment";
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
        path: "products",
        element: <App />,
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
