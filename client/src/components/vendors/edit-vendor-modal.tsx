"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { VendorForm } from "./vendor-form"
import { useGlobalContext } from "../../../context/global-context"

interface EditVendorModalProps {
  vendorId: string
  onClose: () => void
}

export function EditVendorModal({ vendorId, onClose }: EditVendorModalProps) {
  const { openEditVendor, setOpenEditVendor } = useGlobalContext();
  return (
      <Dialog
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              onClose();               // local modal closing logic
            }
          }}
        >
        <DialogContent className="max-w-[700px] min-h-[563px] bg-white dark:bg-darkModal">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
          </DialogHeader>
          <VendorForm vendorId={vendorId} onClose={onClose} />
        </DialogContent>
      </Dialog>
  )
}
