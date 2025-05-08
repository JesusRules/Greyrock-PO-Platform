import { Request, Response } from "express";
import PO from "server/models/PO";
import POCounter from "server/models/POCounter";
import { createNoCacheHeaders } from "server/utils/noCacheResponse";

const createPurchaseOrder = async (req: Request, res: Response) => {
  const { department, ...otherFields } = req.body;

  try {
      // Capitalize or sanitize department
      const departmentCode = department.toUpperCase().slice(0, 4); // e.g., 'ADMIN' → 'ADMI'
    
      // Atomically increment the counter for this department
      const counter = await POCounter.findOneAndUpdate(
        { department: departmentCode },
        { $inc: { count: 1 } },
        { new: true, upsert: true }
      );
    
      // Generate PO Number, e.g., "ADMI-0005"
      const paddedCount = counter.count.toString().padStart(4, '0');
      const poNumber = `${departmentCode}-${paddedCount}`;
    
      const newPO = new PO({
        ...otherFields,
        department: departmentCode,
        poNumber,
      });
    
      await newPO.save();
    
      res
      .set(createNoCacheHeaders())
      .status(201).json({ success: true, purchaseOrder: newPO });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    res
    .set(createNoCacheHeaders())
    .status(500).send("Failed to exchange token.");
  }

};
