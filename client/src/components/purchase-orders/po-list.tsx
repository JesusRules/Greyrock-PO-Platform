"use client"

import { useEffect, useState, useMemo } from "react"
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
// import SignatureModal from "@components/signature/SignatureModal"
import { useGlobalContext } from "../../../context/global-context"
import { PurchaseOrder } from "../../../../types/PurchaseOrder"
import { Tooltip, Modal, Text, Group, Button as MantineButton } from "@mantine/core"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"

export function PurchaseOrderList() {
  const { setOpenSignModal, setOpenViewPO, setCurrentPO, currentPO } = useGlobalContext();
  const { downloadPdf } = usePurchaseOrders()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  // const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  // const [currentPO, setCurrentPO] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast();
  //Redux
  const dispatch = useDispatch<AppDispatch>();
  const purchaseOrders = useAppSelector(state => state.purchaseOrdersRouter.purchaseOrders);
  const departments = useAppSelector(state => state.departmentsReducer.departments);
  const user = useAppSelector(state => state.authReducer.user);
  //PDF
  const [PDFLoader, setPDFLoader] = useState(false);
  // Delete purchase order
  const [poToDelete, setPoToDelete] = useState<PurchaseOrder | null>(null);
  // Fiscal year filter (2025-2026, 2026-2027, etc.)
  const [fiscalYearFilter, setFiscalYearFilter] = useState("all");

  // useEffect(() => { //Instead of storing currentPO in redux, we do this
  //   if (!currentPO) return;

  //   const updatedPO = purchaseOrders.find(po => po._id === currentPO);
  //   if (updatedPO && JSON.stringify(updatedPO) !== JSON.stringify(currentPO)) {
  //     setCurrentPO(updatedPO);
  //   }
  // }, [purchaseOrders, currentPO]);

   const getFiscalYearLabel = (dateInput: string | Date | undefined): string | null => {
      if (!dateInput) return null;
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return null;

      const year = date.getFullYear();
      const month = date.getMonth(); // 0 = Jan, 9 = Oct

      // Fiscal year starts Oct 1
      const startYear = month >= 9 ? year : year - 1;
      const endYear = startYear + 1;

      return `${startYear}-${endYear}`;
    };

    const fiscalYearOptions = useMemo(() => {
      const set = new Set<string>();

      purchaseOrders.forEach((po) => {
        const label = getFiscalYearLabel(po.createdAt as any);
        if (label) set.add(label);
      });

      // Sort ascending; you can reverse() if you want newest first
      return Array.from(set).sort();
    }, [purchaseOrders]);
    
      // const filteredPOs = purchaseOrders.filter((po) => {
  // const query = searchQuery.toLowerCase();

  // const matchesSearch =
  //     (po.vendor?.companyName?.toLowerCase() || "").includes(query) ||
  //     (po.vendor?.email?.toLowerCase() || "").includes(query) ||
  //     (po.poNumber?.toLowerCase() || "").includes(query) ||
  //     po.lineItems?.some(item =>
  //       item.description.toLowerCase().includes(query)
  //     );

  //   const matchesDepartment = departmentFilter === "all" || po.department.name === departmentFilter;
  //   const matchesStatus = statusFilter === "all" || po.status === statusFilter;

  //   return matchesSearch && matchesDepartment && matchesStatus;
  // });
  const filteredPOs = purchaseOrders.filter((po) => {
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      (po.vendor?.companyName?.toLowerCase() || "").includes(query) ||
      (po.vendor?.email?.toLowerCase() || "").includes(query) ||
      (po.poNumber?.toLowerCase() || "").includes(query) ||
      po.lineItems?.some((item) =>
        item.description.toLowerCase().includes(query)
      );

    const matchesDepartment =
      departmentFilter === "all" || po.department.name === departmentFilter;

    const matchesStatus =
      statusFilter === "all" || po.status === statusFilter;

    const poFiscalYear = getFiscalYearLabel(po.createdAt as any);
    const matchesFiscalYear =
      fiscalYearFilter === "all" || poFiscalYear === fiscalYearFilter;

    return matchesSearch && matchesDepartment && matchesStatus && matchesFiscalYear;
  });

  const handleView = (po: any) => {
    setCurrentPO(po._id);
    setOpenViewPO(true);
  }

  const handleEdit = (po: any) => {
    setCurrentPO(po._id)
    console.log('po', po._id)
    setIsEditModalOpen(true);
  }

  // Open confirm modal
  const openDeleteConfirm = (po: PurchaseOrder) => {
    if (!po?._id) {
      alert("Invalid purchase order. Cannot delete.");
      return;
    }
    setPoToDelete(po);
  };

  const cancelDelete = () => {
    setPoToDelete(null);
  };

  const confirmDelete = async () => {
    if (!poToDelete?._id) {
      setPoToDelete(null);
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete purchase order #${poToDelete.poNumber}?`);
    if (!confirmed) return;

    try {
      await dispatch(deletePurchaseOrder(poToDelete._id)).unwrap();
      toast({
        title: "Deleted",
        description: `PO #${poToDelete.poNumber} has been deleted.`,
        variant: "success",
        // variant: "destructive",
      });
    } catch (err) {
      console.error("Failed to delete:", err);
      toast({
        title: "Error",
        description: "Failed to delete the purchase order.",
        variant: "destructive",
      });
    } finally {
      setPoToDelete(null);
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

  // PDF STUFF
   const viewPO_PDF = async (purchaseOrder: PurchaseOrder) => {
    try {
      setPDFLoader(true);
      // window.open(`/pdf/bcr/${item._id}`, "_blank"); // Open in a new tab
      window.open(`${import.meta.env.VITE_API_BASE_URL}/api/purchase-orders/pdf/${purchaseOrder._id}`, "_blank");
      setPDFLoader(false);
    } catch (error) {
      setPDFLoader(false);
      toast({
        title: "Error",
        description: "Failed to open Purchase Order.",
        variant: "destructive",
      });
      console.log(error);
    }
  }

  return (
    <>
    <div className="space-y-4">
      <div className="flex justify-end items-center flex-wrap gap-4">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Purchase Order
        </Button>
      </div>

      {/* <button onClick={() => console.log('user', user)}>CLICK ME</button> */}

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
      <div className="flex gap-4 justify-end flex-col sm:flex-row">
          {/* Fiscal Year */}
          <div className="w-44">
            <Select
              value={fiscalYearFilter}
              onValueChange={setFiscalYearFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Fiscal Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fiscal Years</SelectItem>
                {fiscalYearOptions.map((fy) => (
                  <SelectItem key={fy} value={fy}>
                    {fy}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        
        {/* Departments */}
        <div className="w-48">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {/* Static "All Departments" option */}
              <SelectItem value="all">All Departments</SelectItem>

              {departments
                // Optional: skip a real "All Departments" dept if it exists in DB
                .filter((dept) => dept.name !== "All Departments")
                .map((dept) => (
                  <SelectItem key={dept._id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Statuses */}
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
              <TableHead className="border-l-[1px]" >PO #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center border-r-[1px]">Actions</TableHead>
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
                      (po.status === 'Pending' || po.status === 'Signed') && setOpenSignModal(true)
                      setCurrentPO(po._id)}
                    }
                    className={`cursor-pointer px-2 py-1 rounded-full text-xs font-medium ${
                      po.status === "Signed"
                        ? "bg-green-100 dark:bg-green-700 dark:text-white text-green-800"
                        : po.status === "Approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : po.status === "Pending" 
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-600 dark:text-white"
                        : po.status === "Rejected" 
                        ? "bg-red-200 dark:bg-red-600 dark:text-white" : "bg-white"
                    }`}
                  >
                    {po.status}
                  </span>
                  </TableCell>
                  <TableCell className="text-right">

                    <Tooltip label="View Purchase Order" withArrow>
                    <Button variant="ghost" size="icon" onClick={() => handleView(po)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    </Tooltip>

                    <Tooltip label="Edit Purchase Order" withArrow>
                    <Button className="text-yellow-700 dark:text-yellow-500" variant="ghost" size="icon" onClick={() => handleEdit(po)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    </Tooltip>

                    <Tooltip label="Open/Download Purchase Order (PDF)" withArrow>
                    <Button variant="ghost" size="icon" onClick={() => viewPO_PDF(po)}>
                      <FileDown className="h-4 w-4" />
                    </Button>
                    </Tooltip>

                      {po.status === 'Signed' && (
                        <Tooltip label="Reject Purchase Order" withArrow>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(po)}
                          title="Reject purchase order"
                        >
                          <CheckSquare 
                              className={`h-4 w-4 text-red-600`} />
                        </Button>
                        </Tooltip>
                      )}
                      {po.status === 'Rejected' && (
                        <Tooltip label="Purchase Order Signed?" withArrow>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(po)}
                          title="Reject purchase order"
                        >
                          <CheckSquare 
                              className={`h-4 w-4 text-green-700 dark:text-green-600`} />
                        </Button>
                        </Tooltip>
                      )}

                    <Tooltip label="Delete Purchase Order" withArrow>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteConfirm(po)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    </Tooltip>

                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
      
      <PurchaseOrderModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} mode="create" />

      <PurchaseOrderModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        mode="edit"
        // purchaseOrderId={currentPO}
      />
      <PurchaseOrderViewModal />
      
      {/* {currentPO && (
        <>
        <SignatureModal selectedPurchaseOrder={currentPO}   />
        </>
      )} */}

      <Modal
        opened={poToDelete !== null}
        onClose={cancelDelete}
        title={
            <div
              style={{
                fontSize: '17px',
                position: 'absolute',
                top: 10,
                right: 0,
                left: 0,
                textAlign: 'center',
                display: 'block',
                margin: 0,
                padding: '10px',
              }}
            >
              Delete Purchase Order
            </div>
        }
        centered
      >
        <div className="space-y-0 text-center">
          {/* <Text>
            Are you sure you want to delete purchase order{' '}
            <strong>#{poToDelete?.poNumber}</strong>? This action cannot be undone.
          </Text> */}
          <Text>
            Are you sure you want to delete purchase order
          </Text>
          <Text>
            <strong>{poToDelete?.poNumber}</strong>?
          </Text>
          <Text mt={10}>
            This action cannot be undone.
          </Text>

          <Group justify="center" mt="md">
            <MantineButton variant="default" onClick={cancelDelete}>
              Cancel
            </MantineButton>
            <MantineButton color="red" onClick={confirmDelete}>
              Delete
            </MantineButton>
          </Group>
        </div>
      </Modal>
    </>
  )
}
