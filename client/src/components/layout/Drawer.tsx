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
        <Button variant="ghost" size="icon" className="cursor-pointer fixed  top-2 left-2 z-50">
            <Menu className="w-6 h-6" />
        </Button>
        </SheetTrigger>

        <SheetContent
        side="left"
        className="w-[260px] px-0 flex flex-col justify-between bg-background bg-white text-foreground dark:bg-zinc-900 dark:text-white"
        >
        {/* Top Section */}
        <div>
            <SheetHeader>
            <SheetTitle onClick={() => navigate("/purchase-orders")}
                className="text-center mt-5 text-2xl cursor-pointer" style={{ fontWeight: 800 }}>
                Greyrock Purchase Order Platform
            </SheetTitle>
            </SheetHeader>

            <p className="text-center text-sm mt-5">Logged In: <strong>{user?.firstName} {user?.lastName}</strong></p>
            <p className="text-left text-sm mt-2 ml-4">
              Permission Role: <strong>&nbsp;{user?.permissionRole === 'admin' ? 'Admin' : user?.permissionRole === 'poweruser' ? 'Power User' : user?.permissionRole === 'user' ? 'User' : user?.permissionRole}</strong>
            </p>
            <p className="text-left text-sm mb-10 ml-4">
              Signature Role: <strong>&nbsp;&nbsp;{user?.signatureRole === 'generalManager' ? 'General Manager' : user?.signatureRole === 'financeDepartment' ? 'Finance Department' 
                    : user?.signatureRole === 'overrideSigner' ? 'Override Signer' : user?.signatureRole === 'submitter' ? 'Submitter' : user?.signatureRole}</strong>
            </p>

            <nav className="mt-8 space-y-4 px-2">

            <Button onClick={() => navigate("/profile")}
              variant="ghost"
              className="border-gray-500 border cursor-pointer w-full justify-center text-base bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 py-5"
              >
             Profile
            </Button>

            <Button onClick={() => navigate("/purchase-orders")}
            variant="ghost"
            className="py-2 border-gray-500 border cursor-pointer h-fit w-full justify-center text-base bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
            Manage <br/>Purchase Orders
            </Button>
            
            {(user && user.permissionRole === 'admin') && (
              <Button onClick={() => navigate("/users")}
              variant="ghost"
              className="border-gray-500 border cursor-pointer w-full justify-center text-base bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 py-5"
              >
              Manage Users
              </Button>
            )}
            
            {(user && user.permissionRole === 'admin') && (
              <Button onClick={() => navigate("/departments")}
              variant="ghost"
              className="border-gray-500 border cursor-pointer w-full justify-center text-base bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 py-5"
              >
              Manage Departments
              </Button>
            )}
            
            <Button onClick={() => navigate("/vendors")}
            variant="ghost"
            className="border-gray-500 border cursor-pointer w-full justify-center text-base bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 py-5"
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
            className="w-full justify-center cursor-pointer dark:bg-red-600"
            >
            Logout
            </Button>
        </div>
        </SheetContent>
    </Sheet>
    )
}