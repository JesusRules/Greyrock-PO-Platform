import { PlusCircle } from "lucide-react"
import { Button } from "@components/ui/button"
import { VendorList } from "@components/vendors/vendor-list"
import { CreateVendorModal } from "@components/vendors/create-vendor-modal"
import { Drawer } from "@components/layout/Drawer"

export default function VendorsPage() {
  return (
    <>
    <Drawer />
      <div className="mx-auto py-10 mt-5 max-w-[1100px]">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Vendor Management</h1>
        <CreateVendorModal>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Vendor
          </Button>
        </CreateVendorModal>
      </div>
      <VendorList />
    </div>
    </>
  )
}