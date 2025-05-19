import { useEffect } from "react";
import { Drawer } from "../../components/layout/Drawer";
import { PurchaseOrderList } from "../../components/purchase-orders/po-list";
import { Button } from "../../components/ui/button"
import { fetchVendors } from "../../../redux/features/vendors-slice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../redux/store";
import { toast } from "../../../hooks/use-toast"

export default function POPage() {
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
      <h1 className="text-3xl font-bold mb-6">Purchase Order Management</h1>
        <PurchaseOrderList />
        {/* <Button className="ml-auto flex mt-2" variant='outline'  onClick={() => console.log("Logout")}>
          Logout
          </Button> */}
    </div>
    </>
  )
}