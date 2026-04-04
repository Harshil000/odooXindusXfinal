import { useForm } from "../hook/useForm"
import {Link} from "react-router-dom"
import { ToastContainer } from 'react-toastify';
import useAuth from "../hook/useAuth"
import PasswordField from "../components/PasswordField"
import "../styles/login.scss"

const Login = () => {
    const { formValues , handleChange } = useForm({
        email: "",
        password: ""
    });

    const { LoginUser } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        LoginUser(formValues);
    }

    return (
        <main className="login-register-page">
            <ToastContainer position="top-right" autoClose={3000} theme="dark"/>
            <div className="containerCard">
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <input required onChange={handleChange} type="email" name="email" placeholder="Enter your email" />
                    <PasswordField onChange={handleChange} />
                    <button className="submit-button" type="submit">Login</button>
                </form>
            </div>
            <div className="RedirectCard">
                <span>Don't have an account? <Link to="/register">Register</Link></span>
            </div>
        </main>
    )
}

export default Login