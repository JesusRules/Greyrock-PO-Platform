"use client";

import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useDispatch } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { X } from "lucide-react";
import { AppDispatch, useAppSelector } from "../../../redux/store";
import { PurchaseOrder } from "../../../../types/PurchaseOrder";
import { useGlobalContext } from "../../../context/global-context";
import { useToast } from "../../../hooks/use-toast";
import { signPurchaseOrder } from "../../../redux/features/po-slice";

interface SignatureModalProps {
  selectedPurchaseOrder: PurchaseOrder;
}

export default function SignatureModal({ selectedPurchaseOrder }: SignatureModalProps) {
  const { openSignModal, setOpenSignModal } = useGlobalContext();
  const sigCanvas = useRef<SignatureCanvas>(null);

  const [isSigning, setIsSigning] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const user = useAppSelector((state) => state.authReducer.user);

  useEffect(() => {
    if (!openSignModal || !user) return;

    const existingSignature = selectedPurchaseOrder?.signedImg;

    if (existingSignature) {
      setSignatureUrl(existingSignature);
      setIsSigning(false);
    } else {
      setSignatureUrl(null);
      setIsSigning(true);
      sigCanvas.current?.clear();
    }
  }, [openSignModal, selectedPurchaseOrder, user]);

  const clearSignature = () => sigCanvas.current?.clear();

  const handleSubmit = async () => {
    if (sigCanvas.current?.isEmpty()) {
      toast({
        title: "Error",
        description: "Please sign before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const dataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");
      if (!dataUrl) {
        toast({
          title: "Error",
          description: "Signature pad not ready.",
          variant: "destructive",
        });
        return;
      }

      await dispatch(
        signPurchaseOrder({
          id: selectedPurchaseOrder._id,
          signature: dataUrl,
          signedBy: user?._id!,
        })
      ).unwrap();

      toast({
        title: "Success",
        description: "Signature saved and PO marked as Signed.",
        variant: "success",
      });

      setOpenSignModal(false);
    } catch {
      toast({
        title: "Error",
        description: "Error submitting signature.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={openSignModal} onOpenChange={setOpenSignModal}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white dark:bg-darkModal">
        <DialogHeader className="mb-2">
          <DialogTitle>
            <div className="flex justify-between items-start font-normal">
              <div className="flex flex-col gap-3">
                <span>
                  Signing Purchase Order -{" "}
                  <span className="font-bold">{selectedPurchaseOrder.poNumber}</span>
                </span>
                <span className="ml-5">
                  Department -{" "}
                  <span className="font-bold">
                    {selectedPurchaseOrder.department.name}
                  </span>
                </span>
                <span className="ml-5">
                  Vendor -{" "}
                  <span className="font-bold">
                    {selectedPurchaseOrder.vendor.companyName}
                  </span>
                </span>
                <span className="ml-5">
                  Total - $
                  <span className="font-bold">{selectedPurchaseOrder.total}</span>
                </span>
              </div>

              <button
                className="rounded p-1 hover:bg-muted"
                onClick={() => setOpenSignModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* SIGNATURE AREA (no inner padding, border on canvas) */}
        <div className="flex justify-center">
          {!isSigning && signatureUrl ? (
            <img
              src={signatureUrl}
              alt="Saved Signature"
              className="border border-gray-500 rounded-md bg-white w-[420px] h-[150px] object-contain"
            />
          ) : (
            <SignatureCanvas
              ref={sigCanvas}
              penColor="black"
              backgroundColor="white"
              canvasProps={{
                width: 420,
                height: 150,
                className:
                  "border border-gray-500 rounded-md bg-white block", // border is on the canvas itself
              }}
            />
          )}
        </div>

        {/* BUTTONS CENTERED */}
        <DialogFooter className="flex mx-auto justify-center gap-3 mt-4">
          {isSigning ? (
            <>
              <Button variant="outline" onClick={clearSignature} type="button">
                Clear
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? "Submitting..." : "Submit Signature"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setOpenSignModal(false)}
                type="button"
              >
                Close
              </Button>

              <Button
                onClick={() => {
                  setIsSigning(true);
                  setSignatureUrl(null);
                  setTimeout(() => sigCanvas.current?.clear(), 0);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Re-sign
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// import { Modal, Button, Group, ActionIcon } from "@mantine/core";
// import SignatureCanvas from "react-signature-canvas";
// import { useEffect, useRef, useState } from "react";
// import { useDispatch } from "react-redux";
// import { AppDispatch, useAppSelector } from "../../../redux/store";
// import { PurchaseOrder } from "../../../../types/PurchaseOrder";
// import { useGlobalContext } from "../../../context/global-context";
// import { useToast } from "../../../hooks/use-toast"
// import api from "../../../axiosSetup";
// import { X } from 'lucide-react';
// import { signPurchaseOrder } from "../../../redux/features/po-slice";

// export default function SignatureModal({ selectedPurchaseOrder }: { selectedPurchaseOrder: PurchaseOrder }) {
//   const { openSignModal, setOpenSignModal } = useGlobalContext();
//   const sigCanvas = useRef<SignatureCanvas>(null);
//   //States
//   const [isSigning, setIsSigning] = useState(false);
//   const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const { toast } = useToast();
//   //Redux
//   const dispatch = useDispatch<AppDispatch>();
//   const user = useAppSelector(state => state.authReducer.user);

//   useEffect(() => {
//     setTimeout(() => {
//       fetchImg();
//     }, 0)
//   }, [openSignModal, selectedPurchaseOrder, user]);

//   const fetchImg = async () => {
//     if (!openSignModal || !user) return;
  
//     const existingSignature = selectedPurchaseOrder?.signedImg;
  
//     if (existingSignature) {
//       setSignatureUrl(existingSignature);
//       setIsSigning(false); // Show preview, not canvas
//       console.log("NO", existingSignature)
//     } else {
//       setSignatureUrl(null);
//       console.log("YES")
//       setIsSigning(true); // Go straight to signing mode
//     }
//   };

//   const clearSignature = () => {
//     sigCanvas.current?.clear();
//   };

//   const handleSubmit = async () => {
//     if (sigCanvas.current?.isEmpty()) {
//         toast({
//         title: "Error",
//         description: "Please sign before submitting.",
//         variant: "destructive",
//         });
//         return;
//     }
//     setLoading(true);

//     if (!selectedPurchaseOrder || !user) return;

//     try {
//         const dataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");

//         if (!dataUrl) {
//         toast({
//             title: "Error",
//             description: "Signature pad not ready.",
//             variant: "destructive",
//         });
//         return;
//         }

//         // ✅ Dispatch Redux thunk to update purchase order
//         await dispatch(
//             signPurchaseOrder({ id: selectedPurchaseOrder._id, signature: dataUrl, signedBy: user._id })
//         ).unwrap();

//         toast({
//         title: "Success",
//         description: "Signature saved and PO marked as Signed.",
//         variant: "success",
//         });

//         setOpenSignModal(false);
//         setLoading(false);
//     } catch (error) {
//         setLoading(false);
//         console.error("Error signing:", error);
//         toast({
//         title: "Error",
//         description: "Error submitting signature.",
//         variant: "destructive",
//         });
//     } finally {
//         setLoading(false);
//     }
// };

//   return (
//     <>
//       <Modal
//         withCloseButton={false}
//         opened={openSignModal}
//         onClose={() => setOpenSignModal(false)}
//         zIndex={1000}
//         centered
//         styles={{
//           content: {
//             pointerEvents: 'auto', // Ensure modal itself is clickable
//           },
//           overlay: {
//             pointerEvents: 'auto', // Prevent clicks through the overlay
//           },
//         }}
//         // overlayProps={{
//         //     opacity: 0,
//         // }}
//         title={
//             <div className="w-full flex justify-between items-center">
//             <div className="flex flex-col gap-3">
//                 <span>
//                 Signing Purchase Order -{" "}
//                 <span className="font-semibold">{selectedPurchaseOrder.poNumber}</span>
//                 </span>
//                 <span className="ml-5">
//                 Department -{" "}
//                 <span className="font-semibold">{selectedPurchaseOrder.department.name}</span>
//                 </span>
//                 <span className="ml-5">
//                 Vendor -{" "}
//                 <span className="font-semibold">{selectedPurchaseOrder.vendor.companyName}</span>
//                 </span>
//                 <span className="ml-5">
//                 Total - $<span className="font-semibold">{selectedPurchaseOrder.total}</span>
//                 </span>
//             </div>
//             <button
//                 className="top-2 right-2 absolute rounded"
//                 onClick={() => setOpenSignModal(false)}>
//                  <X className="w-5 h-5" />
//             </button>
//             </div>
//         }>
//           <div style={{ border: "1px solid #ccc", padding: 4}}>
//           {!isSigning && signatureUrl ? (
//             <>
//               <img src={signatureUrl} alt="Saved Signature" className="w-[400px] h-[150px] object-contain" />
//               <Button mt="sm" variant="light" onClick={() => {
//                 setIsSigning(true);
//                 sigCanvas.current?.clear();
//               }}>
//                 Re-sign
//               </Button>
//             </>
//           ) : (
//             <SignatureCanvas
//               ref={sigCanvas}
//               penColor="black"
//               backgroundColor="white"
//               canvasProps={{ width: 400, height: 150, className: "signature-canvas" }}
//             />
//           )}
//         </div>
//         {isSigning && (
//             <Group mt="md" style={{ display: 'flex', justifyContent: 'center'}}>
//               <Button variant="outline" onClick={clearSignature}>
//                 Clear
//               </Button>
//               <Button onClick={handleSubmit} loading={loading}>
//                 Submit Signature
//               </Button>
//             </Group>
//           )}
//       </Modal>
//     </>
//   );
// }
