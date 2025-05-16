import { Drawer } from "../../components/layout/Drawer";
import { PurchaseOrderList } from "../../components/purchase-order/po-list";
import { Button } from "../../components/ui/button"

export default function Home() {
  return (
    <>
    <Drawer />
    <div className="mx-auto py-10 mt-5 max-w-[1100px]">
      <h1 className="text-3xl font-bold mb-6">Purchase Order Management</h1>
        <PurchaseOrderList />
        {/* <Button className="ml-auto flex mt-2" variant='outline'  onClick={() => console.log("Logout")}>
          Logout
          </Button> */}
    </div>
    </>
  )
}