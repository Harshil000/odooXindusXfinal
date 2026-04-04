import {createBrowserRouter} from "react-router-dom";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Public from "./shared/Public";
import App from "./App";

const router = createBrowserRouter([
    {
        path : "/",
        element : <App />
    },
    {
        path : "/login",
        element : <Public><Login /></Public>
    }, 
    {
        path : "/register",
        element : <Public><Register /></Public>
    }
])

export default router;