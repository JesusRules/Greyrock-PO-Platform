import { useState } from "react"
import { Button } from "../../components/ui/button"
import { PlusCircle } from "lucide-react"
import { AppDispatch, useAppSelector } from "../../../redux/store"
import { useDispatch } from "react-redux"
import { ClipLoader } from "react-spinners"
import { UserFormModal } from "./user-form-modal"
import { UserTable } from "./user-table"
import { deleteUser } from "../../../redux/features/users-slice"
import { User } from "../../../../types/User"

export function UserManagement() {
  // const [users, setUsers] = useState<User[]>(initialUsers)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  //Redux
  const dispatch = useDispatch<AppDispatch>();
  const user = useAppSelector(state => state.authReducer.user);
  const users = useAppSelector(state => state.usersReducer.users);
  const initLoad = useAppSelector(state => state.usersReducer.initLoad);

  const handleUserDeleted = async (userId: string) => {
    await dispatch(deleteUser(userId));
  };

  if (initLoad) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center dark:bg-transparent bg-white/60">
        <ClipLoader color="blue" />
      </div>
    )
  }

  if (user && user.role !== 'admin') {
    return(
      <div className="absolute left-0 right-0 top-0 bottom-0 w-full flex justify-center items-center">
        You do not have access to this page.
      </div>
    )
  }


  return (
    <>
    {/* Modal for creating a new user */}
      <UserFormModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />

      {/* Modal for editing an existing user */}
      {editingUser && (
        <UserFormModal
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          initialData={editingUser}
        />
      )}

      <div className="flex justify-end items-center mb-8">
        {/* <h1 className="text-3xl font-bold">Users</h1> */}
        <Button className="cursor-pointer" onClick={() => setIsCreateModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {users && users.length > 0 ? (
        <UserTable users={users} onEdit={setEditingUser} onDelete={handleUserDeleted} />
      ) : (
        <div className="bg-muted/50 p-12 rounded-lg flex flex-col items-center justify-center text-center">
          <h3 className="text-xl font-medium mb-2">No users yet</h3>
          <p className="text-muted-foreground mb-6">Get started by creating your first user.</p>
          <Button className="cursor-pointer" onClick={() => setIsCreateModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      )}
    </>
  )
}
