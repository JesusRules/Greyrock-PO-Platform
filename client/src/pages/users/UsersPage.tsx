"use client"

import { Drawer } from "../../components/general/Drawer";
import { UserManagement } from "../../components/users/user-management"
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../redux/store";
import { fetchUsers } from "../../../redux/features/users-slice";

export default function UsersPage() {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  return (
    <>
    <Drawer />
    <div className="py-10 px-2 mx-auto max-w-[800px]">
      <div className="flex items-center justify-between mb-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          {/* <p className="text-muted-foreground">Manage your customers and their notes</p> */}
        </div>
      </div>
     <UserManagement />
    </div>
    </>
  )
}