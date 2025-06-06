import { useState, useEffect } from "react"
import { AlertTriangle } from "lucide-react"

import { Button } from "../../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { useAppSelector } from "../../../redux/store"

interface DepartmentModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "create" | "edit" | "delete"
  department: string | null
  onCreateDepartment: (departmentName: string, departmentCode: string) => void
  onEditDepartment: (departmentName: string, departmentCode: string) => void
  onDeleteDepartment: () => void
}

export function DepartmentModal({
  isOpen,
  onClose,
  mode,
  department,
  onCreateDepartment,
  onEditDepartment,
  onDeleteDepartment,
}: DepartmentModalProps) {
  const [departmentName, setDepartmentName] = useState("")
  const [departmentCode, setDepartmentCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const departments = useAppSelector(state => state.departmentsReducer.departments);

  useEffect(() => {
    if (mode === "edit" && department) {
      const found = departments.find((d) => d.name === department);
      setDepartmentName(found?.name || "");
      setDepartmentCode(found?.departmentCode || "");
    } else {
      setDepartmentName("");
      setDepartmentCode("");
    }
    setError(null);
  }, [mode, department, isOpen]);


  const validateDepartment = (name: string, code: string): boolean => {
    if (!name.trim()) {
      setError("Department name cannot be empty");
      return false;
    }

    if (!code.trim()) {
      setError("Department code cannot be empty");
      return false;
    }

    const inputName = name.trim().toLowerCase();

    const isDuplicate = departments.some((dept) => {
      const existingName = dept.name.trim().toLowerCase();
      const isSame = inputName === existingName;
      const isEditingDifferent = mode === "edit" && existingName !== department?.trim().toLowerCase();

      return isSame && (mode === "create" || isEditingDifferent);
    });

    if (isDuplicate) {
      setError("Department name already exists");
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (mode === "delete") {
      onDeleteDepartment()
      return
    }
    if (validateDepartment(departmentName, departmentCode)) {
      if (mode === "create") {
        onCreateDepartment(departmentName, departmentCode);
      } else if (mode === "edit") {
        onEditDepartment(departmentName, departmentCode);
      }
    }
  }

  const renderTitle = () => {
    switch (mode) {
      case "create":
        return "Add Department"
      case "edit":
        return "Edit Department"
      case "delete":
        return "Delete Department"
    }
  }

  const renderDescription = () => {
    switch (mode) {
      case "create":
        return "Add a new department to your organization."
      case "edit":
        return "Edit the selected department name."
      case "delete":
        return "Are you sure you want to delete this department?"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-darkModal">
        <DialogHeader>
          <DialogTitle>{renderTitle()}</DialogTitle>
          <DialogDescription>{renderDescription()}</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {mode !== "delete" ? (
          <div className="grid gap-4 py-4 mx-7">
            <div className="">
              <Label htmlFor="name" className="text-right col-span-1 self-center">
                Name
              </Label>
              <Input
                id="name"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
            <div className="">
              <Label htmlFor="code" className="text-right col-span-1 self-center">
                Code
              </Label>
              <Input
                id="code"
                value={departmentCode}
                onChange={(e) => setDepartmentCode(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
        ) : (
          <div className="py-4">
            <p>
              Are you sure you want to delete <strong>{department}</strong>? This action cannot be undone.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant={mode === "delete" ? "destructive" : "default"}>
            {mode === "create" ? "Create" : mode === "edit" ? "Save" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
