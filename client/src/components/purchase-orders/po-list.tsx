"use client"

import { useState } from "react"
import { Search, Plus, FileDown, Eye, Pencil, CheckSquare, Trash2 } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { usePurchaseOrders } from "../../../context/po-context"
import { formatCurrency, getFormattedDateTime } from "../../../utils/general"
import { PurchaseOrderViewModal } from "./po-view-modal"
// import { PurchaseOrderModal } from "./po-modal"
import { PurchaseOrderModal } from "./po-modal-2"
import { AppDispatch, useAppSelector } from "../../../redux/store"
import { useDispatch } from "react-redux"
import { deletePurchaseOrder, togglePurchaseOrderStatus } from "../../../redux/features/po-slice"
import { useToast } from "../../../hooks/use-toast"
import SignatureModal from "@components/signature/SignatureModal"
import { useGlobalContext } from "../../../context/global-context"

export function PurchaseOrderList() {
  const { setOpenSignModal, setOpenViewPO } = useGlobalContext();
  const { downloadPdf } = usePurchaseOrders()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  // const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentPO, setCurrentPO] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast();
  //Delete purchase order
  const [poToDelete, setPoToDelete] = useState<any>(null)
  //Redux
  const dispatch = useDispatch<AppDispatch>();
  const purchaseOrders = useAppSelector(state => state.purchaseOrdersRouter.purchaseOrders);
  const departments = useAppSelector(state => state.departmentsReducer.departments);

  const filteredPOs = purchaseOrders.filter((po) => {
  const query = searchQuery.toLowerCase();

  const matchesSearch =
      (po.vendor?.companyName?.toLowerCase() || "").includes(query) ||
      (po.vendor?.email?.toLowerCase() || "").includes(query) ||
      (po.poNumber?.toLowerCase() || "").includes(query) ||
      po.lineItems?.some(item =>
        item.description.toLowerCase().includes(query)
      );

    const matchesDepartment = departmentFilter === "all" || po.department.name === departmentFilter;
    const matchesStatus = statusFilter === "all" || po.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleView = (po: any) => {
    setCurrentPO(po)
    setOpenViewPO(true)
  }

  const handleEdit = (po: any) => {
    setCurrentPO(po)
    setIsEditModalOpen(true)
  }

  const handleDelete = async (po: any) => {
    if (!po?._id) {
      alert("Invalid purchase order. Cannot delete.");
      return;
    }
    const confirmed = window.confirm(`Are you sure you want to delete purchase order #${po.poNumber}?`);
    if (!confirmed) return;

    try {
      await dispatch(deletePurchaseOrder(po._id)).unwrap();
      toast({
        title: "Deleted",
        description: `PO #${po.poNumber} has been deleted.`,
        variant: "destructive",
      });
    } catch (err) {
      console.error("Failed to delete:", err);
      toast({
        title: "Error",
        description: "Failed to delete the purchase order.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (po: any) => {
    try {
      const updatedPO = await dispatch(togglePurchaseOrderStatus(po._id)).unwrap();
      setCurrentPO(updatedPO); // Optional: useful if modal is open

      toast({
        title: "Status Updated",
        description: `PO #${updatedPO.poNumber} is now ${updatedPO.status}.`,
        variant: "success",
      });

      // Optional: re-fetch or manually update list if needed
      // await dispatch(fetchPurchaseOrders());
    } catch (err: any) {
      console.error("Failed to toggle status:", err);
      toast({
        title: "Error",
        description: err || "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
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
              {departments
              // .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
              .map((dept) => (
                <SelectItem key={dept._id} value={dept.name === "All Departments" ? "all" : dept.name}>
                  {dept.name}
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
                <TableRow key={po._id}>
                  <TableCell>{po.poNumber}</TableCell>
                  <TableCell>{getFormattedDateTime(String(po.date))}</TableCell>
                  <TableCell>{po.vendor.companyName}</TableCell>
                  <TableCell>{po.department.name}</TableCell>
                  <TableCell>{formatCurrency(po.total)}</TableCell>
                  <TableCell className="text-center">
                    {(po.lineItems || []).length}
                  </TableCell>
                  <TableCell>
                  <span
                    onClick={() => { 
                      po.status === 'Pending' && setOpenSignModal(true)
                      setCurrentPO(po)}
                    }
                    className={`cursor-pointer px-2 py-1 rounded-full text-xs font-medium ${
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
                    <Button variant="ghost" size="icon" onClick={() => downloadPdf(po._id)}>
                      <FileDown className="h-4 w-4" />
                    </Button>
                    {/* {po.status !== "Signed" && ( */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(po)}
                        title="Toggle Status"
                      >
                        <CheckSquare 
                            className={`h-4 w-4 ${po.status === 'Pending' ? 'text-green-600' 
                                                : po.status === 'Signed' ? 'text-yellow-600' : 'text-black'}`} />
                      </Button>
                      {/* )} */}
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
            purchaseOrder={currentPO}
          />
        </>
      )}
      
      {currentPO && (
        <>
        <SignatureModal selectedPurchaseOrder={currentPO}   />
        {/* <div className="fixed w-full h-full bg-red-500 top-0 z-[100] bg-[#0000006b]"/> */}
        </>
      )}

    </>
  )
}
