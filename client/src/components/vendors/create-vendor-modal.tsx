import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@components/ui/dialog"
import { VendorForm } from "./vendor-form"
import { useGlobalContext } from "../../../context/global-context"

export function CreateVendorModal() {
  const { openCreateVendor, setOpenCreateVendor } = useGlobalContext();
  return (
        <Dialog
          open={openCreateVendor}
          onOpenChange={(open) => {
            if (!open) {
              setOpenCreateVendor(false);            // local modal closing logic
            }
          }}
        >        
        <DialogContent className={`sm:max-w-[700px] bg-white dark:bg-darkModal`}>
          <DialogHeader>
            <DialogTitle>Add New Vendor</DialogTitle>
          </DialogHeader>
          <VendorForm />
        </DialogContent>
      </Dialog>
  )
}
