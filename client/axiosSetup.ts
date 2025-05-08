import axios from "axios";
import { store } from "./redux/store";
import { logoutUser } from "./redux/features/auth-slice";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "https://api.bcr-system.ca/",
    withCredentials: true, // ✅ Ensures cookies are sent with requests
    headers: {
        "Content-Type": "application/json",
    }
});

// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401) {
//             console.log("User is unauthorized, logging out...");
//             // store.dispatch(logoutUser());
//             window.location.href = "/";
//         }
//         return Promise.reject(error);
//     }
// );

export default api;
