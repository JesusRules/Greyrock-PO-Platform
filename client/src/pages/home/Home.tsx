import { PurchaseOrderList } from "@components/purchase-order/po-list";

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Purchase Order Management</h1>
        <PurchaseOrderList />
    </div>
  )
}