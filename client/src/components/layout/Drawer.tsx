'use client'

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../components/ui/sheet"
import { Button } from "../../components/ui/button"
import { Menu } from "lucide-react"
import { logoutUser } from "../../../redux/features/auth-slice";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "../../../redux/store";
import { useNavigate } from "react-router-dom";

export function Drawer() {
    const dispatch = useDispatch<AppDispatch>();
    const user = useAppSelector(state => state.authReducer.user);
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate("/");
    };
    
    return (
    <Sheet>
        <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="cursor-pointer absolute top-2 left-2 z-50">
            <Menu className="w-6 h-6" />
        </Button>
        </SheetTrigger>

        <SheetContent
        side="left"
        className="w-[250px] flex flex-col justify-between bg-background bg-white text-foreground dark:bg-zinc-900 dark:text-white"
        >
        {/* Top Section */}
        <div>
            <SheetHeader>
            <SheetTitle onClick={() => navigate('/home')} 
                className="text-center mt-5 text-2xl cursor-pointer" style={{ fontWeight: 800 }}>
                Greyrock Purchase Order Platform
            </SheetTitle>
            </SheetHeader>

            {/* <p className="text-center text-sm mb-10">Logged In: {user?.firstName} ({user?.lastName})</p> */}

            <nav className="mt-8 space-y-4 px-2">
            <Button onClick={() => navigate("/users")}
            variant="ghost"
            className="cursor-pointer w-full justify-center text-base bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
            Manage Users
            </Button>
            <Button onClick={() => navigate("/vendors")}
            variant="ghost"
            className="cursor-pointer w-full justify-center text-base bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
            Manage Vendors
            </Button>
            </nav>
        </div>

        {/* Bottom Section */}
        <div className="px-2 pb-4">
            <Button 
            onClick={() => handleLogout()}
            variant="destructive"
            className="w-full justify-center cursor-pointer"
            >
            Logout
            </Button>
        </div>
        </SheetContent>
    </Sheet>
    )
}