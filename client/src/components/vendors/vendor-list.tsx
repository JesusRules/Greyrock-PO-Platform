"use client"

import { useState, useEffect } from "react"
import { Edit, Trash2 } from "lucide-react"

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
import { deleteVendor } from "./actions"

interface Vendor {
  id: string
  companyName: string
  email: string
  phoneNumber: string
  address: string
  comment: string
}

export function VendorList() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [vendorToDelete, setVendorToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchVendors() {
      try {
        const response = await fetch("/api/vendors")
        if (!response.ok) throw new Error("Failed to fetch vendors")
        const data = await response.json()
        setVendors(data)
      } catch (error) {
        console.error("Error fetching vendors:", error)
        toast({
          title: "Error",
          description: "Failed to load vendors. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchVendors()
  }, [toast])

  const handleDeleteClick = (id: string) => {
    setVendorToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!vendorToDelete) return

    try {
      await deleteVendor(vendorToDelete)
      setVendors(vendors.filter((vendor) => vendor.id !== vendorToDelete))
      toast({
        title: "Success",
        description: "Vendor deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting vendor:", error)
      toast({
        title: "Error",
        description: "Failed to delete vendor. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setVendorToDelete(null)
    }
  }

  const refreshVendors = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/vendors")
      if (!response.ok) throw new Error("Failed to fetch vendors")
      const data = await response.json()
      setVendors(data)
    } catch (error) {
      console.error("Error refreshing vendors:", error)
      toast({
        title: "Error",
        description: "Failed to refresh vendors. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading vendors...</div>
  }

  if (vendors.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">No vendors found</p>
        <Button onClick={() => document.getElementById("add-vendor-button")?.click()}>Add your first vendor</Button>
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
              <TableHead>Email</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell className="font-medium">{vendor.companyName}</TableCell>
                <TableCell>{vendor.email}</TableCell>
                <TableCell>{vendor.phoneNumber}</TableCell>
                <TableCell className="max-w-[200px] truncate">{vendor.address}</TableCell>
                <TableCell className="max-w-[200px]">
                  {vendor.comment ? (
                    <CommentViewModal comment={vendor.comment} companyName={vendor.companyName}>
                      <span className="truncate block">{vendor.comment}</span>
                    </CommentViewModal>
                  ) : (
                    <span className="text-muted-foreground italic">No comment</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <EditVendorModal vendorId={vendor.id}>
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </EditVendorModal>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDeleteClick(vendor.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
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
    </div>
  )
}
