"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"

import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { DepartmentModal } from "../../components/departments/department-modal"
import { Drawer } from "@components/layout/Drawer"

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
    <div className="mx-auto py-10 mt-5 max-w-[900px] px-3">
      <div className="mb-0">
      <h1 className="text-3xl font-bold">Departments</h1>
      <p className="text-[16px] text-gray-700 dark:text-gray-400">Manage the Purchase Orders' departments</p>
      </div>
      
      <Card className="border-[0px] shadow-none bg-transparent">
        <CardHeader className="flex flex-row items-center justify-end border-[0px]">
          {/* <div>
            <CardTitle>Departments</CardTitle>
            <CardDescription>Manage your organization's departments</CardDescription>
          </div> */}
          <Button onClick={() => handleOpenModal("create")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Department
          </Button>
        </CardHeader>
        <CardContent className="px-2">
          <div className="grid gap-0">
            {departments.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No departments found. Create one to get started.</p>
            ) : (
              departments.map((department, index) => (
                <div key={index} className="flex items-center justify-between p-2 py-3 border rounded-lg">
                  <span className="font-medium">{department}</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal("edit", department, index)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal("delete", department, index)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
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
    </>
  )
}
