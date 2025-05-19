"use client"

import { useState } from "react"
import { Pencil, Trash2, Sparkles } from "lucide-react"

import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader } from "../../components/ui/card"
import { DepartmentModal } from "../../components/departments/department-modal"
import { Drawer } from "../../components/layout/Drawer"
import { motion } from "framer-motion"

// Default departments
const defaultDepartments = [
  "Administration",
  "Boutique",
  "Events",
  "Food and Beverage",
  "Gaming",
  "IT",
  "Maintenance",
  "Marketing",
  "Security",
  "Surveillance",
  "Vault",
]

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
  const [departments, setDepartments] = useState<string[]>(defaultDepartments)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit" | "delete">("create")
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const handleOpenModal = (mode: "create" | "edit" | "delete", department?: string, index?: number) => {
    setModalMode(mode)
    setSelectedDepartment(department || null)
    setSelectedIndex(index !== undefined ? index : null)
    setIsModalOpen(true)
  }

  const handleCreateDepartment = (departmentName: string) => {
    setDepartments([...departments, departmentName])
    setIsModalOpen(false)
  }

  const handleEditDepartment = (departmentName: string) => {
    if (selectedIndex !== null) {
      const updatedDepartments = [...departments]
      updatedDepartments[selectedIndex] = departmentName
      setDepartments(updatedDepartments)
      setIsModalOpen(false)
    }
  }

  const handleDeleteDepartment = () => {
    if (selectedIndex !== null) {
      const updatedDepartments = departments.filter((_, index) => index !== selectedIndex)
      setDepartments(updatedDepartments)
      setIsModalOpen(false)
    }
  }

  return (
    <>
      <Drawer />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="mx-auto py-10 mt-5 max-w-[900px] px-6">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Departments
            </h1>
            <p className="text-[16px] text-gray-700 dark:text-gray-400 mt-2">
              Manage the Purchase Orders' departments.
            </p>
          </div>

          <Card className="border-[0px] shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-end border-b border-gray-100 dark:border-gray-700 pb-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => handleOpenModal("create")}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
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
                  departments.map((department, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      className={`flex items-center justify-between p-4 border rounded-xl shadow-sm ${cardColors[index % cardColors.length]} dark:bg-gray-700 dark:border-gray-600 transition-all duration-200`}
                    >
                      <span className="font-medium">{department}</span>
                      <div className="flex gap-2">
                        <Button
                          className="text-yellow-700 dark:text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenModal("edit", department, index)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenModal("delete", department, index)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <DepartmentModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            mode={modalMode}
            department={selectedDepartment}
            departments={departments}
            onCreateDepartment={handleCreateDepartment}
            onEditDepartment={handleEditDepartment}
            onDeleteDepartment={handleDeleteDepartment}
          />
        </div>
      </div>
    </>
  )
}
