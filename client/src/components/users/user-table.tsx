import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Button } from "../../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react"
import { useToast } from "../../../hooks/use-toast"
import { useGlobalContext } from "../../../context/global-context"
import { User } from "../../../../types/User"
import { deleteUser } from "../../../redux/features/users-slice"

interface UserTableProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (userId: string) => void
}

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
    // const { openDeleteUser, setOpenDeleteUser } = useGlobalContext();
  const [openDeleteUser, setOpenDeleteUser] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast();

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setOpenDeleteUser(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    try {
      setIsDeleting(true)
      await deleteUser(userToDelete._id)
      toast({
        title: 'Success',
        description: 'The user has been deleted successfully.',
        variant: 'success',
      });
      setOpenDeleteUser(false)
      onDelete(userToDelete._id)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-100">
                      <img
                          src={"/images/placeholder-avatar.jpg"}
                          alt={`generic-avatar`}
                          className="object-cover"
                        />
                      {/* {user.avatar ? (
                        <Image
                          src={user.avatar || "/placeholder.svg"}
                          alt={`${user.firstName} ${user.lastName}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-500">
                          {user.firstName.charAt(0)}
                          {user.lastName.charAt(0)}
                        </div>
                      )} */}
                    </div>
                    <div>
                      <div className="font-medium">
                        {user?.firstName} {user?.lastName}
                      </div>
                      {/* <div className="text-sm text-muted-foreground">@{user?.login}</div> */}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="capitalize">{user.role}</div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phoneNumber}</TableCell>
                <TableCell>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {/* <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(user)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem> */}
                      <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(user)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem  onClick={() => handleDeleteClick(user)} className="cursor-pointer text-red-600">
                      {/* <DropdownMenuItem onClick={() => handleDeleteClick(user)} className="text-red-600"> */}
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    
      <Dialog open={openDeleteUser} onOpenChange={setOpenDeleteUser}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="bg-white dark:bg-darkModal">
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this user?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the user
              {userToDelete && ` ${userToDelete.firstName} ${userToDelete.lastName}`} and remove their data from the
              system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="cursor-pointer" variant="outline" onClick={() => setOpenDeleteUser(false)}>
              Cancel
            </Button>
            <Button className="cursor-pointer" variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
