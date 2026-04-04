import { useForm } from "../hook/useForm"
import useAuth from "../hook/useAuth"
import { Link } from "react-router-dom"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import PasswordField from "../components/PasswordField"
import "../styles/login.scss"

const Register = () => {
    const { formValues, handleChange } = useForm({
        email: "",
        name: "",
        password: "",
        role: "staff",
        restaurant_name: ""
    });

    const { RegisterUser } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        RegisterUser(formValues);
    }


    return (
        <main className="login-register-page">
            <ToastContainer position="top-right" autoClose={3000} theme="dark"/>
            <div className="containerCard">
                <h1>Register</h1>
                <form onSubmit={handleSubmit}>
                    <input onChange={handleChange} required type="text" name="name" placeholder="Enter your Full name" />
                    <select name="role" value={formValues.role} onChange={handleChange} required>
                        <option value="staff">Staff</option>
                        <option value="owner">Owner</option>
                    </select>
                    {formValues.role === "owner" && (
                        <input
                            onChange={handleChange}
                            required
                            type="text"
                            name="restaurant_name"
                            placeholder="Enter restaurant name"
                        />
                    )}
                    <input onChange={handleChange} required type="email" name="email" placeholder="Enter your email" />
                    <PasswordField onChange={handleChange} />
                    <button className="submit-button" type="submit">Register</button>
                </form>
            </div>
            <div className="RedirectCard">
                <span>Already have an account? <Link to="/login">Login</Link></span>
            </div>
        </main>
    )
}

export default Register