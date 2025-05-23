import { Modal, Button, Group, ActionIcon } from "@mantine/core";
import SignatureCanvas from "react-signature-canvas";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "../../../redux/store";
import { PurchaseOrder } from "../../../../types/PurchaseOrder";
import { useGlobalContext } from "../../../context/global-context";
import { useToast } from "../../../hooks/use-toast"
import api from "../../../axiosSetup";
import { X } from 'lucide-react';
import { signPurchaseOrder } from "../../../redux/features/po-slice";

export default function SignatureModal({ selectedPurchaseOrder }: { selectedPurchaseOrder: PurchaseOrder }) {
  const { openSignModal, setOpenSignModal } = useGlobalContext();
  const sigCanvas = useRef<SignatureCanvas>(null);
  //States
  const [isSigning, setIsSigning] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  //Redux
  const dispatch = useDispatch<AppDispatch>();
  const user = useAppSelector(state => state.authReducer.user);

  useEffect(() => {
    setTimeout(() => {
      fetchImg();
    }, 0)
  }, [openSignModal, selectedPurchaseOrder, user]);

  const fetchImg = async () => {
    if (!openSignModal || !user) return;
  
    const existingSignature = selectedPurchaseOrder?.signedImg;
  
    if (existingSignature) {
      setSignatureUrl(existingSignature);
      setIsSigning(false); // Show preview, not canvas
      console.log("NO", existingSignature)
    } else {
      setSignatureUrl(null);
      console.log("YES")
      setIsSigning(true); // Go straight to signing mode
    }
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
  };

  const handleSubmit = async () => {
    if (sigCanvas.current?.isEmpty()) {
        toast({
        title: "Error",
        description: "Please sign before submitting.",
        variant: "destructive",
        });
        return;
    }
    setLoading(true);

    if (!selectedPurchaseOrder || !user) return;

    try {
        const dataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");

        if (!dataUrl) {
        toast({
            title: "Error",
            description: "Signature pad not ready.",
            variant: "destructive",
        });
        return;
        }

        // ✅ Dispatch Redux thunk to update purchase order
        await dispatch(
            signPurchaseOrder({ id: selectedPurchaseOrder._id, signature: dataUrl, signedBy: user._id })
        ).unwrap();

        toast({
        title: "Success",
        description: "Signature saved and PO marked as Signed.",
        variant: "success",
        });

        setOpenSignModal(false);
        setLoading(false);
    } catch (error) {
        setLoading(false);
        console.error("Error signing:", error);
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
    <>
      <Modal
        withCloseButton={false}
        opened={openSignModal}
        onClose={() => setOpenSignModal(false)}
        zIndex={1000}
        centered
        styles={{
            content: {
            pointerEvents: 'auto', // Ensure modal itself is clickable
            },
            overlay: {
            pointerEvents: 'auto', // Prevent clicks through the overlay
            }
        }}
        // overlayProps={{
        //     opacity: 0,
        // }}
        title={
            <div className="w-full flex justify-between items-center">
            <div className="flex flex-col gap-3">
                <span>
                Signing Purchase Order -{" "}
                <span className="font-semibold">{selectedPurchaseOrder.poNumber}</span>
                </span>
                <span className="ml-5">
                Department -{" "}
                <span className="font-semibold">{selectedPurchaseOrder.department.name}</span>
                </span>
                <span className="ml-5">
                Vendor -{" "}
                <span className="font-semibold">{selectedPurchaseOrder.vendor.companyName}</span>
                </span>
                <span className="ml-5">
                Total - $<span className="font-semibold">{selectedPurchaseOrder.total}</span>
                </span>
            </div>
            <button
                className="top-2 right-2 absolute rounded"
                onClick={() => setOpenSignModal(false)}>
                 <X className="w-5 h-5" />
            </button>
            </div>
        }>
          <div style={{ border: "1px solid #ccc", padding: 8}}>
          {!isSigning && signatureUrl ? (
            <>
              <img src={signatureUrl} alt="Saved Signature" className="w-[400px] h-[150px] object-contain" />
              <Button mt="sm" variant="light" onClick={() => {
                setIsSigning(true);
                sigCanvas.current?.clear();
              }}>
                Re-sign
              </Button>
            </>
          ) : (
            <SignatureCanvas
              ref={sigCanvas}
              penColor="black"
              canvasProps={{ width: 400, height: 150, className: "signature-canvas" }}
            />
          )}
        </div>
        {isSigning && (
            <Group mt="md" style={{ display: 'flex', justifyContent: 'center'}}>
              <Button variant="outline" onClick={clearSignature}>
                Clear
              </Button>
              <Button onClick={handleSubmit} loading={loading}>
                Submit Signature
              </Button>
            </Group>
          )}
      </Modal>
    </>
  );
}
