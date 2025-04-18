import React, { useEffect, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../redux/store";
import { loginUser, logoutUser, setUser } from "../../../redux/features/auth-slice";
import api from "../../../axiosSetup";

interface AuthCheckerProps {
  children: ReactNode;
}

const AuthChecker = ({ children }: AuthCheckerProps) => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        if (pathname !== '/') {
          fetchUser();
        }
      }, [pathname]);
      
      const fetchUser = async () => {
        try {
          const response = await api.get(`/api/users/me`);
          dispatch(setUser(response.data.user));
        } catch (error) {
          console.error("User verification failed:", error);
          dispatch(logoutUser());
          navigate("/");
        }
      };
    
    return <>{children}</>
}

export default AuthChecker;