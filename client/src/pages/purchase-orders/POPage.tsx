import { useEffect } from "react";
import { Drawer } from "../../components/layout/Drawer";
import { PurchaseOrderList } from "../../components/purchase-orders/po-list";
import { Button } from "../../components/ui/button"
import { fetchVendors } from "../../../redux/features/vendors-slice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../redux/store";
import { toast } from "../../../hooks/use-toast"
import { fetchDepartments } from "../../../redux/features/departments-slice";
import { fetchPurchaseOrders } from "../../../redux/features/po-slice";
import { fetchUsers } from "../../../redux/features/users-slice";
import ColorSchemeToggle from "@components/layout/ColorSchemeToggle";

export default function POPage() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchUsers()).unwrap().catch((err) => {
      console.error('Error fetching users:', err);
      toast({
        title: 'Error',
        description: 'Failed to load users. Please try again.',
        variant: 'destructive',
      });
    });
    dispatch(fetchVendors()).unwrap().catch((err) => {
      console.error('Error fetching vendors:', err);
      toast({
        title: 'Error',
        description: 'Failed to load vendors. Please try again.',
        variant: 'destructive',
      });
    });
    dispatch(fetchDepartments()).unwrap().catch((err) => {
      console.error('Error fetching departments:', err);
      toast({
        title: 'Error',
        description: 'Failed to load departments. Please try again.',
        variant: 'destructive',
      });
    });
    dispatch(fetchPurchaseOrders()).unwrap().catch((err) => {
      console.error('Error fetching purchase orders:', err);
      toast({
        title: 'Error',
        description: 'Failed to fetch purchase orders. Please try again.',
        variant: 'destructive',
      });
    });
  }, [dispatch, toast]);

  return (
    <>
    <ColorSchemeToggle />
    <Drawer />
    <div className="mx-auto py-10 mt-5 max-w-[1200px] px-3">
      <h1 className="text-3xl font-bold mb-6">Purchase Order Management</h1>
        <PurchaseOrderList />
    </div>
    </>
  )
}