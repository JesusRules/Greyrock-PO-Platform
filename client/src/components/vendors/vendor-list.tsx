"use client"

import { useState, useEffect } from "react"
import { Edit, Trash2, Eye } from "lucide-react"

import { Button } from "@components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog"
import { useToast } from "../../../hooks/use-toast"
import { EditVendorModal } from "./edit-vendor-modal"
import { CommentViewModal } from "./comment-view-modal"
import { useGlobalContext } from "../../../context/global-context"
import { deleteVendor, fetchVendors } from "../../../redux/features/vendors-slice"
import { AppDispatch, useAppSelector } from "../../../redux/store"
import { useDispatch } from "react-redux"
import { VendorViewModal } from "./view-vendor-modal"
import { Tooltip } from "@mantine/core"

interface Vendor {
  id: string
  companyName: string
  email: string
  phoneNumber: string
  address: string
  comment: string
}

export function VendorList() {
  const { setOpenCreateVendor, setOpenEditVendor } = useGlobalContext();
  const [vendorBeingEdited, setVendorBeingEdited] = useState<string | null>(null);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [vendorToDelete, setVendorToDelete] = useState<string | null>(null)
  const { toast } = useToast()
  const [viewVendor, setViewVendor] = useState<any | null>(null);
  //Redux
  const dispatch = useDispatch<AppDispatch>();
  const vendors = useAppSelector(state => state.vendorsReducer.vendors);
  const vendorsInitLoad = useAppSelector(state => state.vendorsReducer.initLoad);

   const handleDeleteClick = (id: string) => {
    setVendorToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!vendorToDelete) return;

    try {
      await dispatch(deleteVendor(vendorToDelete)).unwrap();
      toast({
        title: 'Success',
        description: 'Vendor deleted successfully',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete vendor. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setVendorToDelete(null);
    }
  };

  const refreshVendors = async () => {
    try {
      await dispatch(fetchVendors()).unwrap();
      toast({
        title: 'Refreshed',
        description: 'Vendor list updated.',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error refreshing vendors:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh vendors. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (vendorsInitLoad) {
    return <div className="text-center py-10">Loading vendors...</div>
  }

  if (vendors.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">No vendors found</p>
        <Button onClick={() => setOpenCreateVendor(true)}>Add your first vendor</Button>
      </div>
    )
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Contact Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Address</TableHead>
              {/* <TableHead>Comment</TableHead> */}
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor._id}>
                <TableCell className="font-medium">{vendor.companyName}</TableCell>
                <TableCell>{vendor.contactName}</TableCell>
                <TableCell>{vendor.email}</TableCell>
                <TableCell>{vendor.phoneNumber}</TableCell>
                <TableCell className="max-w-[200px] truncate">{vendor.address}</TableCell>
                {/* <TableCell className="max-w-[200px]">
                  {vendor.comment ? (
                    <CommentViewModal comment={vendor.comment} companyName={vendor.companyName}>
                      <span className="truncate block">{vendor.comment}</span>
                    </CommentViewModal>
                  ) : (
                    <span className="text-muted-foreground italic">No comment</span>
                  )}
                </TableCell> */}
                <TableCell>
                  <div className="flex space-x-2">
                    <Tooltip label="View Vendor" withArrow>
                      <Button
                        onClick={() => setViewVendor(vendor)}
                        variant="outline"
                        size="icon"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      </Tooltip>

                      <Tooltip label="Edit Vendor" withArrow>
                      <Button
                        onClick={() => setVendorBeingEdited(vendor._id!)}
                        variant="outline"
                        size="icon"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      </Tooltip>

                    <Tooltip label="Delete Vendor" withArrow>
                     <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive dark:text-red-500"
                      onClick={() => handleDeleteClick(vendor._id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white dark:bg-darkModal">
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this vendor?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the vendor from your system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {viewVendor && (
      <VendorViewModal
        isOpen={!!viewVendor}
        onClose={() => setViewVendor(null)}
        vendor={viewVendor}
      />
    )}
    {vendorBeingEdited && (
      <EditVendorModal
        vendorId={vendorBeingEdited}
        onClose={() => setVendorBeingEdited(null)}
      />
    )}
    </div>
  )
}
