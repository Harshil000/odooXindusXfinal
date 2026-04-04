import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { register, login, logout } from "../services/auth.api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function useAuth() {
    const context = useContext(AuthContext);
    const { setUser, setLoading , user } = context;
    const navigate = useNavigate();

    async function RegisterUser(formValues) {
        try {
            setLoading(true);

            const payload = {
                name: formValues.name,
                email: formValues.email.toLowerCase(),
                password: formValues.password,
                role: formValues.role,
                ...(formValues.role === "owner" ? { restaurant_name: formValues.restaurant_name } : {}),
                ...(formValues.role === "staff" ? { restaurant_id: formValues.restaurant_id } : {}),
            };

            const response = await register(payload);
            setUser(response.user);
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
            const response = await login({ email: formValues.email.toLowerCase(), password: formValues.password });
            setUser(response.user);
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

    async function LogoutUser() {
        try {
            await logout();
            setUser(null);
            navigate("/login");
        } catch (error) {
            toast.error(error?.message || "Logout failed");
        }
    }
    
    return { RegisterUser, LoginUser, LogoutUser ,user }
}

export default useAuth;