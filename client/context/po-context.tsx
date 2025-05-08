"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

// Sample data
const samplePurchaseOrders = [
  {
    id: "1",
    poNumber: "PO-2023-0001",
    date: "2023-11-15",
    payment: "Check",
    vendor: "Grey Rock Entertainment Center Inc.",
    contactName: "John Smith",
    contactAddress: "100 Chief Joanna Blvd, Madawaska Maliseet First Nation, NB, E7C 0C1",
    phone: "506-735-2838",
    email: "Finance@GreyRock-Casino.com",
    payableTo: "Grey Rock Entertainment Center Inc.",
    submitter: "Emily-Rose Robinson",
    manager: "Cindy Bernard",
    department: "Administration",
    shipping: "25",
    taxRate: "13",
    items: [
      {
        id: "1",
        description: "Office Supplies",
        quantity: "10",
        unitPrice: "15.99",
        lineTotal: "159.90",
      },
    ],
    subtotal: 159.9,
    tax: 20.79,
    total: 205.69,
    status: "Pending",
  },
  {
    id: "2",
    poNumber: "PO-2023-0002",
    date: "2023-12-01",
    payment: "Wire Transfer",
    vendor: "Casino Equipment Suppliers",
    contactName: "Jane Doe",
    contactAddress: "200 Gaming Ave, Montreal, QC, H2X 3Y7",
    phone: "514-555-1234",
    email: "sales@casinoequipment.com",
    payableTo: "Casino Equipment Suppliers Inc.",
    submitter: "Emily-Rose Robinson",
    manager: "Cindy Bernard",
    department: "Marketing",
    shipping: "150",
    taxRate: "13",
    items: [
      {
        id: "1",
        description: "Gaming Chips - Premium Set",
        quantity: "5",
        unitPrice: "299.99",
        lineTotal: "1499.95",
      },
      {
        id: "2",
        description: "Card Shuffler - Automatic",
        quantity: "2",
        unitPrice: "450.00",
        lineTotal: "900.00",
      },
    ],
    subtotal: 2399.95,
    tax: 311.99,
    total: 2861.94,
    status: "Signed",
  },
]

interface PurchaseOrderContextType {
  purchaseOrders: any[]
  addPurchaseOrder: (po: any) => void
  updatePurchaseOrder: (po: any) => void
  downloadPdf: (id: string) => void
}

const PurchaseOrderContext = createContext<PurchaseOrderContextType | undefined>(undefined)

export function PurchaseOrderProvider({ children }: { children: ReactNode }) {
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([])

  // useEffect(() => {
  //   // In a real app, you would fetch from an API or database
  //   setPurchaseOrders(samplePurchaseOrders)
  // }, [])
  useEffect(() => {
    const stored = localStorage.getItem("testPurchaseOrders")
    if (stored) {
      setPurchaseOrders(JSON.parse(stored))
    } else {
      setPurchaseOrders(samplePurchaseOrders)
    }
  }, [])

  // const addPurchaseOrder = (po: any) => {
  //   const newPO = {
  //     ...po,
  //     id: (purchaseOrders.length + 1).toString(),
  //   }
  //   setPurchaseOrders([...purchaseOrders, newPO])
  // }
  const addPurchaseOrder = (po: any) => {
    const newPO = {
      ...po,
      id: (purchaseOrders.length + 1).toString(),
    }
    const updated = [...purchaseOrders, newPO]
    setPurchaseOrders(updated)
    localStorage.setItem("testPurchaseOrders", JSON.stringify(updated))
  }

  // const updatePurchaseOrder = (po: any) => {
  //   setPurchaseOrders(purchaseOrders.map((item) => (item.id === po.id ? po : item)))
  // }
  const updatePurchaseOrder = (po: any) => {
    const updated = purchaseOrders.map((item) => (item.id === po.id ? po : item))
    setPurchaseOrders(updated)
    localStorage.setItem("testPurchaseOrders", JSON.stringify(updated))
  }

  const downloadPdf = (id: string) => {
    const po = purchaseOrders.find((item) => item.id === id)
    if (!po) return

    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.text("PURCHASE ORDER", 14, 20)

    doc.setFontSize(12)
    doc.text(`PO #: ${po.poNumber}`, 14, 30)
    doc.text(`Date: ${po.date}`, 14, 36)
    doc.text(`Department: ${po.department}`, 14, 42)

    // Vendor Info
    doc.setFontSize(14)
    doc.text("Vendor:", 14, 55)
    doc.setFontSize(12)
    doc.text(po.vendor, 14, 62)
    doc.text(po.contactName, 14, 68)
    const addressLines = po.contactAddress.split("\n")
    addressLines.forEach((line: string, i: number) => {
      doc.text(line, 14, 74 + i * 6)
    })
    doc.text(`Phone: ${po.phone}`, 14, 86)
    doc.text(`Email: ${po.email}`, 14, 92)

    // Payment Info
    doc.setFontSize(14)
    doc.text("Payment Details:", 120, 55)
    doc.setFontSize(12)
    doc.text(`Method: ${po.payment}`, 120, 62)
    doc.text(`Payable To: ${po.payableTo}`, 120, 68)

    // Approval Info
    doc.text(`Submitter: ${po.submitter}`, 120, 80)
    doc.text(`Manager: ${po.manager}`, 120, 86)

    // Items Table
    const tableColumn = ["Description", "Qty", "Unit Price", "Total"]
    const tableRows = po.items.map((item: any) => [
      item.description,
      item.quantity,
      `$${Number.parseFloat(item.unitPrice).toFixed(2)}`,
      `$${Number.parseFloat(item.lineTotal).toFixed(2)}`,
    ])

    // @ts-ignore - jspdf-autotable types
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 100,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 66, 66] },
    })

    // Summary
    const finalY = (doc as any).lastAutoTable.finalY + 10
    doc.text(`Subtotal: $${po.subtotal.toFixed(2)}`, 140, finalY)
    doc.text(`Tax (${po.taxRate}%): $${po.tax.toFixed(2)}`, 140, finalY + 6)
    doc.text(`Shipping: $${Number.parseFloat(po.shipping).toFixed(2)}`, 140, finalY + 12)
    doc.text(`Total: $${po.total.toFixed(2)}`, 140, finalY + 20)

    // Status
    if (po.status === "Signed") {
      doc.text(`Signed by: ${po.signedBy || po.manager}`, 14, finalY + 30)
      doc.text(`Date: ${po.signedDate || po.date}`, 14, finalY + 36)
    }

    doc.save(`PO-${po.poNumber}.pdf`)
  }

  return (
    <PurchaseOrderContext.Provider
      value={{
        purchaseOrders,
        addPurchaseOrder,
        updatePurchaseOrder,
        downloadPdf,
      }}
    >
      {children}
    </PurchaseOrderContext.Provider>
  )
}

export function usePurchaseOrders() {
  const context = useContext(PurchaseOrderContext)
  if (context === undefined) {
    throw new Error("usePurchaseOrders must be used within a PurchaseOrderProvider")
  }
  return context
}
