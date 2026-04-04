import {createBrowserRouter} from "react-router-dom";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Public from "./shared/Public";
import Private from "./shared/Private";
import App from "./App";

const router = createBrowserRouter([
    {
        path : "/",
        element : <Private><App /></Private>
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