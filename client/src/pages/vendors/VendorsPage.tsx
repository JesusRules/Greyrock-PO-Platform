import { PlusCircle } from "lucide-react"
import { Button } from "@components/ui/button"
import { VendorList } from "@components/vendors/vendor-list"
import { CreateVendorModal } from "@components/vendors/create-vendor-modal"
import { Drawer } from "@components/layout/Drawer"
import { useEffect, useState } from "react"
import { useGlobalContext } from "../../../context/global-context"
import { useDispatch } from "react-redux"
import { AppDispatch } from "../../../redux/store"
import { fetchVendors } from "../../../redux/features/vendors-slice"
import { toast } from "../../../hooks/use-toast"

export default function VendorsPage() {
  const { setOpenCreateVendor } = useGlobalContext();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchVendors()).unwrap().catch((err) => {
      console.error('Error fetching vendors:', err);
      toast({
        title: 'Error',
        description: 'Failed to load vendors. Please try again.',
        variant: 'destructive',
      });
    });
  }, [dispatch, toast]);

  return (
    <>
    <Drawer />
      <div className="mx-auto py-10 mt-5 max-w-[1100px] px-3">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Vendor Management</h1>
          <Button onClick={() => {
            setOpenCreateVendor(true)
          }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Vendor
          </Button>
      </div>
      <CreateVendorModal />
      <VendorList />
    </div>
    </>
  )
}