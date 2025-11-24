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
import { User } from "../../../../types/User"
import { deleteUser } from "../../../redux/features/users-slice"

// ⭐ NEW Mantine imports
import {
  Modal,
  Text,
  Group,
  Badge,
  Stack,
  Divider,
  Title,
} from "@mantine/core"

interface UserTableProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (userId: string) => void
}

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  const [openDeleteUser, setOpenDeleteUser] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // ⭐ NEW view state
  const [viewUser, setViewUser] = useState<User | null>(null)
  const [openViewUser, setOpenViewUser] = useState(false)

  const { toast } = useToast()

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
        title: "Success",
        description: "The user has been deleted successfully.",
        variant: "success",
      })
      setOpenDeleteUser(false)
      onDelete(userToDelete._id)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // ⭐ NEW – helpers for pretty labels
  const formatPermissionRole = (role?: string) => {
    if (!role) return "-"
    if (role === "admin") return "Admin"
    if (role === "poweruser") return "Power User"
    if (role === "user") return "User"
    return role
  }

  const formatSignatureRole = (role?: string) => {
    if (!role) return "-"
    if (role === "generalManager") return "General Manager"
    if (role === "financeDepartment") return "Finance Department"
    if (role === "overrideSigner") return "Override Signer"
    return role
  }

  const handleViewClick = (user: User) => {
    setViewUser(user)
    setOpenViewUser(true)
  }

  const isUserPermissionRole = (role?: string) =>
    role?.toLowerCase() === "user"

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Permission Role</TableHead>
              <TableHead>Signature Role</TableHead>
              <TableHead>Email</TableHead>
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
                    </div>
                    <div>
                      <div className="font-medium">
                        {user?.firstName} {user?.lastName}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="capitalize">
                    {formatPermissionRole(user.permissionRole)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="capitalize">
                    {formatSignatureRole(user.signatureRole)}
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end">
                    {/* ✅ Desktop / tablet: inline icon buttons */}
                    <div className="hidden sm:flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 cursor-pointer border-[0px]"
                        onClick={() => handleViewClick(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 cursor-pointer border-[0px]"
                        onClick={() => onEdit(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      {/* <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 cursor-pointer border-[0px]"
                        onClick={() => handleDeleteClick(user)}
                        disabled
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button> */}
                    </div>

                    {/* 📱 Mobile: keep dropdown */}
                    <div className="sm:hidden">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 cursor-pointer"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleViewClick(user)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => onEdit(user)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled
                            onClick={() => handleDeleteClick(user)}
                            className="cursor-pointer dark:text-red-500 text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </TableCell>
                {/* <TableCell>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 cursor-pointer"
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => handleViewClick(user)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => onEdit(user)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled
                        onClick={() => handleDeleteClick(user)}
                        className="cursor-pointer dark:text-red-500 text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Existing delete dialog (unchanged) */}
      <Dialog open={openDeleteUser} onOpenChange={setOpenDeleteUser}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="bg-white dark:bg-darkModal"
        >
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this user?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the user
              {userToDelete &&
                ` ${userToDelete.firstName} ${userToDelete.lastName}`}{" "}
              and remove their data from the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={() => setOpenDeleteUser(false)}
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ⭐ NEW: View User Mantine modal */}
      <Modal
        opened={openViewUser}
        onClose={() => setOpenViewUser(false)}
        title="User Details"
        centered
      >
        {viewUser && (
          <Stack gap="sm" className="border-[1px] border-gray-500 px-4 py-5 rounded-sm">
            <Group justify="space-between" align="flex-start">
              <div>
                <Title order={4}>
                  {viewUser.firstName} {viewUser.lastName}
                </Title>
                <Text size="sm" mt={3}>
                  {viewUser.email}
                </Text>
                <Text size="xs" mt={3}>
                  Created:{" "}
                  {new Date(viewUser.createdAt!).toLocaleString("en-CA", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </div>

              <div
                style={{
                  maxWidth: 220,
                  minWidth: 220,
                  minHeight: 80,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid gray",
                  background: "white",
                  padding: 4,
                  borderRadius: 4,
                }}
              >
                {viewUser.signedImg ? (
                  <img
                    src={viewUser.signedImg}
                    alt="User signature"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <Text size="xs" c="dimmed">
                    No signed image uploaded
                  </Text>
                )}
              </div>
            </Group>

            {/* <Divider color="gray" className="bg-gray-900" /> */}

            <Group grow>
              <Stack gap={3} className="">
                <Text size="sm" fw={500}>
                  Permission Role
                </Text>
                <Badge radius="sm" variant="">
                  {formatPermissionRole(viewUser.permissionRole)}
                </Badge>
              </Stack>

              <Stack gap={3} className="">
                <Text size="sm" fw={500}>
                  Signature Role
                </Text>
                <Badge radius="sm" variant="">
                  {formatSignatureRole(viewUser.signatureRole)}
                </Badge>
              </Stack>
            </Group>

            {/* <button onClick={() => console.log('viewUser', viewUser)}>CLICK ME</button> */}

            {/* ⭐ Departments only if permissionRole === 'user' */}
            {isUserPermissionRole(viewUser.permissionRole) && (
              <Stack gap={6} mt="sm">
                <Text size="sm" fw={500}>
                  User Departments
                </Text>

              {Array.isArray(viewUser.departments) &&
                viewUser.departments.length > 0 ? (
                  <Group gap="xs">
                    {viewUser.departments.map((dept: any) => {
                      const key =
                        typeof dept === "string" ? dept : dept._id ?? dept.name
                      const label =
                        typeof dept === "string"
                          ? dept
                          : `${dept.name}${
                              dept.departmentCode
                                ? ` (${dept.departmentCode})`
                                : ""
                            }`

                      return (
                        <Badge
                          key={key}
                          radius="xl"
                          variant="outline"
                          size="md"
                        >
                          {label}
                        </Badge>
                      )
                    })}
                  </Group>
                ) : (
                  <Text size="sm" c="dimmed">
                    No departments assigned.
                  </Text>
                )}
              </Stack>
            )}
          </Stack>
        )}
      </Modal>
    </>
  )
}

// import { useState } from "react"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "../../components/ui/dropdown-menu"
// import { Button } from "../../components/ui/button"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "../../components/ui/dialog"
// import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react"
// import { useToast } from "../../../hooks/use-toast"
// import { useGlobalContext } from "../../../context/global-context"
// import { User } from "../../../../types/User"
// import { deleteUser } from "../../../redux/features/users-slice"

// interface UserTableProps {
//   users: User[]
//   onEdit: (user: User) => void
//   onDelete: (userId: string) => void
// }

// export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
//     // const { openDeleteUser, setOpenDeleteUser } = useGlobalContext();
//   const [openDeleteUser, setOpenDeleteUser] = useState(false)
//   const [userToDelete, setUserToDelete] = useState<User | null>(null)
//   const [isDeleting, setIsDeleting] = useState(false)
//   const { toast } = useToast();

//   const handleDeleteClick = (user: User) => {
//     setUserToDelete(user)
//     setOpenDeleteUser(true)
//   }

//   const handleDeleteConfirm = async () => {
//     if (!userToDelete) return

//     try {
//       setIsDeleting(true)
//       await deleteUser(userToDelete._id)
//       toast({
//         title: 'Success',
//         description: 'The user has been deleted successfully.',
//         variant: 'success',
//       });
//       setOpenDeleteUser(false)
//       onDelete(userToDelete._id)
//     } catch (error) {
//       console.error(error)
//       toast({
//         title: 'Error',
//         description: 'Something went wrong. Please try again.',
//         variant: 'destructive',
//       });
//     } finally {
//       setIsDeleting(false)
//     }
//   }

//   return (
//     <>
//       <div className="rounded-md border">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>User</TableHead>
//               <TableHead>Permission Role</TableHead>
//               <TableHead>Signature Role</TableHead>
//               <TableHead>Email</TableHead>
//               {/* <TableHead>Phone Number</TableHead> */}
//               <TableHead className="w-[100px]">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {users.map((user) => (
//               <TableRow key={user._id}>
//                 <TableCell>
//                   <div className="flex items-center gap-3">
//                     <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-100">
//                       <img
//                           src={"/images/placeholder-avatar.jpg"}
//                           alt={`generic-avatar`}
//                           className="object-cover"
//                         />
//                       {/* {user.avatar ? (
//                         <Image
//                           src={user.avatar || "/placeholder.svg"}
//                           alt={`${user.firstName} ${user.lastName}`}
//                           fill
//                           className="object-cover"
//                         />
//                       ) : (
//                         <div className="h-full w-full flex items-center justify-center text-gray-500">
//                           {user.firstName.charAt(0)}
//                           {user.lastName.charAt(0)}
//                         </div>
//                       )} */}
//                     </div>
//                     <div>
//                       <div className="font-medium">
//                         {user?.firstName} {user?.lastName}
//                       </div>
//                       {/* <div className="text-sm text-muted-foreground">@{user?.login}</div> */}
//                     </div>
//                   </div>
//                 </TableCell>
//                 <TableCell>
//                   <div className="capitalize">
//                     {user.permissionRole === 'admin' ? 'Admin' : user.permissionRole === 'poweruser' ? 'Power User' : user.permissionRole}
//                   </div>
//                 </TableCell>
//                 <TableCell>
//                   <div className="capitalize">
//                     {user.signatureRole === 'generalManager' ? 'General Manager' : user.signatureRole === 'financeDepartment' ? 'Finance Department' 
//                     : user.signatureRole === 'overrideSigner' ? 'Override Signer' : user.signatureRole}
//                   </div>
//                 </TableCell>
//                 <TableCell>{user.email}</TableCell>
//                 {/* <TableCell>{user.phoneNumber}</TableCell> */}
//                 <TableCell>
//                   <DropdownMenu modal={false}>
//                     <DropdownMenuTrigger asChild>
//                       <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
//                         <span className="sr-only">Open menu</span>
//                         <MoreHorizontal className="h-4 w-4" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                       <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                       <DropdownMenuSeparator />
//                       <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(user)}>
//                         <Eye className="mr-2 h-4 w-4" />
//                         View
//                       </DropdownMenuItem>
//                       <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(user)}>
//                         <Pencil className="mr-2 h-4 w-4" />
//                         Edit
//                       </DropdownMenuItem>
//                       <DropdownMenuItem disabled  onClick={() => handleDeleteClick(user)} className="cursor-pointer dark:text-red-500 text-red-600">
//                       {/* <DropdownMenuItem onClick={() => handleDeleteClick(user)} className="text-red-600"> */}
//                         <Trash2 className="mr-2 h-4 w-4" />
//                         Delete
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>
    
//       <Dialog open={openDeleteUser} onOpenChange={setOpenDeleteUser}>
//         <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="bg-white dark:bg-darkModal">
//           <DialogHeader>
//             <DialogTitle>Are you sure you want to delete this user?</DialogTitle>
//             <DialogDescription>
//               This action cannot be undone. This will permanently delete the user
//               {userToDelete && ` ${userToDelete.firstName} ${userToDelete.lastName}`} and remove their data from the
//               system.
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button className="cursor-pointer" variant="outline" onClick={() => setOpenDeleteUser(false)}>
//               Cancel
//             </Button>
//             <Button className="cursor-pointer" variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
//               {isDeleting ? "Deleting..." : "Delete"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   )
// }
