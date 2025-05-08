"use client"

import { useState } from "react"
import { Search, Plus, FileDown, Eye, Pencil, CheckSquare } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { usePurchaseOrders } from "../../../context/po-context"
import { formatCurrency } from "../../../utils/general"
import { PurchaseOrderViewModal } from "./po-view-modal"
import { PurchaseOrderModal } from "./po-modal"

export function PurchaseOrderList() {
  const { purchaseOrders, downloadPdf } = usePurchaseOrders()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentPO, setCurrentPO] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPOs = purchaseOrders.filter(
    (po) =>
      po.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleView = (po: any) => {
    setCurrentPO(po)
    setIsViewModalOpen(true)
  }

  const handleEdit = (po: any) => {
    setCurrentPO(po)
    setIsEditModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search purchase orders..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Purchase Order
        </Button>
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
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        po.status === "Signed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {po.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleView(po)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(po)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => downloadPdf(po.id)}>
                      <FileDown className="h-4 w-4" />
                    </Button>
                    {po.status !== "Signed" && (
                      <Button variant="ghost" size="icon" onClick={() => {}}>
                        <CheckSquare className="h-4 w-4" />
                      </Button>
                    )}
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
