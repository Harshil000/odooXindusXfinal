import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { register , login } from "../services/auth.api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function useAuth() {
    const context = useContext(AuthContext);
    const { user, loading, error, token, setUser, setLoading, setError, setToken } = context;
    const navigate = useNavigate();

    async function RegisterUser(formValues) {
        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("name", formValues.name);
            formData.append("email", formValues.email.toLowerCase());
            formData.append("password", formValues.password);
            formData.append("role", formValues.role);

            if (formValues.role === "owner") {
                formData.append("restaurant_name", formValues.restaurant_name);
            }

            let user = await register(formData);
            setUser(user);
            setToken(user.accessToken);
            navigate("/");
        } catch (error) {
            if (Array.isArray(error?.errors)) {
                error.errors.forEach((item) => {
                    if (item?.msg) {
                        toast.error(item.msg);
                    }
                });
            } else {
                toast.error(error?.message || "Registration failed");
            }
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }

    async function LoginUser(formValues) {
        try {
            setLoading(true);
            let user = await login({ email: formValues.email.toLowerCase(), password: formValues.password });
            setUser(user);
            setToken(user.accessToken);
            navigate("/");
        } catch (error) {
            if (Array.isArray(error?.errors)) {
                error.errors.forEach((item) => {
                    if (item?.msg) {
                        toast.error(item.msg);
                    }
                });
            } else {
                toast.error(error?.message || "Login failed");
            }
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }

    return { RegisterUser , LoginUser }
}

export default useAuth;