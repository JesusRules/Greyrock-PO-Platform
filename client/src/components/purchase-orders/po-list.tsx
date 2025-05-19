"use client"

import { useState } from "react"
import { Search, Plus, FileDown, Eye, Pencil, CheckSquare, Trash2 } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { usePurchaseOrders } from "../../../context/po-context"
import { departments, formatCurrency } from "../../../utils/general"
import { PurchaseOrderViewModal } from "./po-view-modal"
// import { PurchaseOrderModal } from "./po-modal"
import { PurchaseOrderModal } from "./po-modal-2"

export function PurchaseOrderList() {
  const { purchaseOrders, downloadPdf } = usePurchaseOrders()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentPO, setCurrentPO] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  //Delete purchase order
  const [poToDelete, setPoToDelete] = useState<any>(null)

  const filteredPOs = purchaseOrders.filter((po) => {
    const matchesSearch =
      (po.vendor?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (po.poNumber?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (po.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())

    const matchesDepartment = departmentFilter === "all" || po.department === departmentFilter
    const matchesStatus = statusFilter === "all" || po.status === statusFilter

    return matchesSearch && matchesDepartment && matchesStatus
  })

  const handleView = (po: any) => {
    setCurrentPO(po)
    setIsViewModalOpen(true)
  }

  const handleEdit = (po: any) => {
    setCurrentPO(po)
    setIsEditModalOpen(true)
  }

  const handleDelete = (po: any) => {
    if (!po?.id) {
      alert("Invalid purchase order. Cannot delete.")
      return
    }
    const confirmed = window.confirm(`Are you sure you want to delete PO #${po.poNumber}?`)
    if (!confirmed) return
    const updated = purchaseOrders.filter((p) => p.id !== po.id)
    localStorage.setItem("testPurchaseOrders", JSON.stringify(updated))
    window.location.reload()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center flex-wrap gap-4">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Purchase Order
        </Button>
      </div>

      <div className="flex justify-between gap-5 items-end">
        <div className="relative w-full max-w-[330px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search purchase orders..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      <div className="flex gap-4 justify-end">
        <div className="w-48">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept === "All Departments" ? "all" : dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-40">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
              <SelectItem value="Signed">Signed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPOs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No purchase orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredPOs.map((po) => (
                <TableRow key={po.id}>
                  <TableCell>{po.poNumber}</TableCell>
                  <TableCell>{po.date}</TableCell>
                  <TableCell>{po.vendor}</TableCell>
                  <TableCell>{po.department}</TableCell>
                  <TableCell>{formatCurrency(po.total)}</TableCell>
                  <TableCell className="text-center">
                    {(po.items || po.lineItems || []).length}
                  </TableCell>
                  <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      po.status === "Signed"
                        ? "bg-green-100 text-green-800"
                        : po.status === "Approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {po.status}
                  </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleView(po)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button className="text-yellow-700 dark:text-yellow-500" variant="ghost" size="icon" onClick={() => handleEdit(po)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => downloadPdf(po.id)}>
                      <FileDown className="h-4 w-4" />
                    </Button>
                    {po.status !== "Signed" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const updatedStatus = po.status === "Pending" ? "Approved" : "Pending"
                            const stored = JSON.parse(localStorage.getItem("testPurchaseOrders") || "[]")

                            const updatedList = stored.map((item: any) =>
                              item.id === po.id ? { ...item, status: updatedStatus } : item
                            )

                            localStorage.setItem("testPurchaseOrders", JSON.stringify(updatedList))
                            window.location.reload()
                          }}
                          title={`Mark as ${po.status === "Pending" ? "Approved" : "Pending"}`}
                        >
                          <CheckSquare className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(po)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PurchaseOrderModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} mode="create" />

      {currentPO && (
        <>
          <PurchaseOrderModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            mode="edit"
            purchaseOrder={currentPO}
          />
          <PurchaseOrderViewModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            purchaseOrder={currentPO}
          />
        </>
      )}
    </div>
  )
}
