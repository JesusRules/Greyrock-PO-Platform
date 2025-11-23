import { useEffect, useState } from "react"
import { Pencil, Trash2, Plus } from "lucide-react"

import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader } from "../../components/ui/card"
import { DepartmentModal } from "../../components/departments/department-modal"
import { Drawer } from "../../components/layout/Drawer"
import { motion } from "framer-motion"
import { useDispatch } from "react-redux"
import { AppDispatch, useAppSelector } from "../../../redux/store"
import { useToast } from "../../../hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog"
import { createDepartment, deleteDepartment, fetchDepartments, updateDepartment } from "../../../redux/features/departments-slice"
import { Tooltip, Modal, Text, Group, Button as MantineButton } from "@mantine/core"

// Department card colors for visual variety
const cardColors = [
  "bg-pink-50 border-pink-200 hover:bg-pink-100",
  "bg-purple-50 border-purple-200 hover:bg-purple-100",
  "bg-blue-50 border-blue-200 hover:bg-blue-100",
  "bg-cyan-50 border-cyan-200 hover:bg-cyan-100",
  "bg-teal-50 border-teal-200 hover:bg-teal-100",
  "bg-green-50 border-green-200 hover:bg-green-100",
  "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
  "bg-orange-50 border-orange-200 hover:bg-orange-100",
]

export default function DepartmentsPage() {
  // const [departments, setDepartments] = useState<string[]>(defaultDepartments)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "delete">("create")
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [showLockedModal, setShowLockedModal] = useState(false);
  const { toast } = useToast()
  //Redux
  const dispatch = useDispatch<AppDispatch>();
  const departments = useAppSelector(state => state.departmentsReducer.departments);
  const user = useAppSelector(state => state.authReducer.user);

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch])

  const handleOpenModal = (mode: "create" | "edit" | "delete", department?: string, index?: number) => {
    setModalMode(mode)
    setSelectedDepartment(department || null)
    setSelectedIndex(index !== undefined ? index : null)
    setIsModalOpen(true)
  }

  const handleCreateDepartment = async (name: string, code: string) => {
    try {
      await dispatch(createDepartment({ name, departmentCode: code }));
      setIsModalOpen(false)
      toast({
          title: 'Success',
          description: 'Department created successfully',
          variant: 'success',
      });
    } catch (error) {
      toast({
          title: 'Error',
          description: 'Issue creating department.',
          variant: 'destructive',
      });
      console.error(error);
    }
  }

  const handleEditDepartment = async (name: string, code: string) => {
    try {
      console.log('departmentCode', code)
      if (selectedIndex !== null) {
        const department = departments[selectedIndex]
         await dispatch(updateDepartment({ id: department._id, name, departmentCode: code }));
        setIsModalOpen(false)
        toast({
          title: 'Success',
          description: 'Department updated successfully.',
          variant: 'success',
        });
      }
    } catch (error) {
      toast({
          title: 'Error',
          description: 'Issue updating department.',
          variant: 'destructive',
      });
      console.error(error);
    }
  }

  const handleDeleteDepartment = async () => {
    try {
      if (selectedIndex !== null) {
        const department = departments[selectedIndex]
        await dispatch(deleteDepartment(department._id))
        setIsModalOpen(false)
        toast({
          title: 'Success',
          description: 'Department deleted successfully.',
          variant: 'success',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
          title: 'Error',
          description: 'Issue deleting a department.',
          variant: 'destructive',
      });
    }
  }

  if (user && user.permissionRole !== 'admin') {
    return(
      <div className="absolute left-0 right-0 top-0 bottom-0 w-full flex justify-center items-center">
        You do not have access to this page.
      </div>
    )
  }

  return (
    <>
      <Drawer />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto py-10 max-w-[900px] px-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200">Departments</h1>
            <p className="text-[16px] text-slate-600 dark:text-slate-400 mt-2">
              Manage the Purchase Orders' departments
            </p>
          </div>

          <Card className="border border-slate-500 shadow-md bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-end border-slate-200 dark:border-slate-700 pb-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  onClick={() => handleOpenModal("create")}
                  // className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-5 py-2 rounded-md shadow-sm hover:shadow-md transition-all duration-200 dark:bg-gray-900"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Department
                </Button>
              </motion.div>
            </CardHeader>
            <CardContent className="px-4 py-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {departments.length === 0 ? (
                <p className="text-center text-muted-foreground py-4 col-span-2">
                  No departments found. Create one to get started.
                </p>
              ) : (
              departments.map((department, index) => {
                const isLocked = false; // Or: const isLocked = department.locked;

                return (
                  <div
                    key={index}
                    className={`
                      flex items-center justify-between p-4 border rounded-lg shadow-sm 
                      ${isLocked ? "bg-gray-100 dark:bg-gray-700" : "bg-slate-50 dark:bg-slate-800"} 
                      border-slate-500 dark:border-slate-500 
                      transition-all duration-200
                    `}
                  >
                    <div className="flex flex-col">
                      <span
                        className={`
                          font-medium
                          ${isLocked ? "italic text-gray-500 dark:text-gray-400" : "text-slate-800 dark:text-slate-200"}
                        `}
                      >
                        {department.name}
                      </span>
                      {department.departmentCode && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">Code: {department.departmentCode}</p>
                      )}
                    </div>

                    <div className="flex gap-0">
                      <Tooltip label="Edit Department" withArrow>
                      <Button
                        className={`
                          ${isLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-200 dark:hover:bg-slate-600"}
                          text-black dark:text-slate-400
                        `}
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (isLocked) {
                            setShowLockedModal(true);
                          } else {
                            handleOpenModal("edit", department.name, index);
                          }
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      </Tooltip>
                      
                      <Tooltip label="Delete Department" withArrow>
                      <Button
                        className={`
                          ${isLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-red-50 dark:hover:bg-red-900/20"}
                          text-red-600
                        `}
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (isLocked) {
                            setShowLockedModal(true);
                          } else {
                            handleOpenModal("delete", department.name, index);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                      </Tooltip>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          </CardContent>
          </Card>

          <DepartmentModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            mode={modalMode}
            department={selectedDepartment}
            onCreateDepartment={handleCreateDepartment}
            onEditDepartment={handleEditDepartment}
            onDeleteDepartment={handleDeleteDepartment}
          />
        </div>
      </div>
      <Dialog open={showLockedModal} onOpenChange={setShowLockedModal}>
        <DialogContent className="max-w-sm bg-white dark:bg-zinc-900">
          <DialogHeader>
            <DialogTitle>Restricted Action</DialogTitle>
            <DialogDescription>
              Default departments cannot be altered.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowLockedModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
