"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { VendorForm } from "./vendor-form"
import { useGlobalContext } from "../../../context/global-context"

interface EditVendorModalProps {
  // children: React.ReactNode
  vendorId: string
}

export function EditVendorModal({ vendorId }: EditVendorModalProps) {
  const { openEditVendor, setOpenEditVendor } = useGlobalContext();
  return (
      <Dialog open={openEditVendor} onOpenChange={setOpenEditVendor}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-darkModal">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
          </DialogHeader>
          <VendorForm vendorId={vendorId} />
        </DialogContent>
      </Dialog>
  )
}
