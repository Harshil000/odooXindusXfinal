import { useForm } from "../hook/useForm"
import useAuth from "../hook/useAuth"
import { useState } from "react";
import { Link } from "react-router-dom"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import PasswordField from "../components/PasswordField"
import FileInput from "../components/FileInput"
import "../styles/login.scss"

const Register = () => {
    const { formValues, handleChange } = useForm({
        email: "",
        name: "",
        username: "",
        password: "",
        bio: ""
    });
    const [profilePictureFile, setProfilePictureFile] = useState(null);

    const { RegisterUser } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        RegisterUser(formValues, profilePictureFile);
    }


    return (
        <main className="login-register-page">
            <ToastContainer position="top-right" autoClose={3000} theme="dark"/>
            <div className="containerCard">
                <h1>Register</h1>
                <form onSubmit={handleSubmit}>
                    <input onChange={handleChange} required type="text" name="name" placeholder="Enter your Full name" />
                    <input onChange={handleChange} required type="text" name="username" placeholder="Enter your Username" />
                    <FileInput onChange={handleChange} onFileSelect={setProfilePictureFile} />
                    <input onChange={handleChange} required type="email" name="email" placeholder="Enter your email" />
                    <PasswordField onChange={handleChange} />
                    <textarea required rows={8} onChange={handleChange} name="bio" placeholder="Enter your bio" />
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