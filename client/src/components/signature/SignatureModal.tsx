import { Modal, Button, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import SignatureCanvas from "react-signature-canvas";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

export default function SignatureModal() {
  const { openSignModal, setOpenSignModal, selectedBCR, setSelectedBCR, selectedItem, setLoader } = useGlobalContext();
  const { enterEnhancedSearch, enterSimpleSearch, searchType, simpleSearchString } = useSearchContext();
  const sigCanvas = useRef<SignatureCanvas>(null);
  //States
  const [isSigning, setIsSigning] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  //Redux
  const dispatch = useDispatch<AppDispatch>();
  const user = useAppSelector(state => state.authReducer.user);
  const mode = useAppSelector(state => state.fileExplorerReducer.mode);

  useEffect(() => {
    setTimeout(() => {
      fetchImg();
    }, 0)
  }, [openSignModal, selectedBCR, user]);

  const fetchImg = async () => {
    if (!openSignModal || !selectedBCR?.participantUsers || !user) return;
  
    const currentParticipant = selectedBCR.participantUsers.find(
      (p) =>
        p.user === user._id ||
        (typeof p.user === "object" && "_id" in p.user && p.user._id === user._id)
    );
  
    const existingSignature = currentParticipant?.signatureImg;
  
    if (existingSignature) {
      setSignatureUrl(existingSignature);
      setIsSigning(false); // Show preview, not canvas
    } else {
      setSignatureUrl(null);
      setIsSigning(true); // Go straight to signing mode
    }
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
  };

  const handleSubmit = async () => {
    if (sigCanvas.current?.isEmpty()) {
      toast.error("Please sign before submitting");
      return;
    }
  
    setLoading(true);
  
    if (selectedBCR === null || user === null || selectedItem === null) return;
  
    try {
      const dataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");
  
      if (!dataUrl) {
        toast.error("Signature pad not ready.");
        return;
      }
  
      // ✅ Send base64 directly to backend
      const response = await api.put(`/api/bcrs/${selectedBCR._id}/sign`, {
        userId: user._id,
        signature: dataUrl,
      });
  
      const file: FileOrFolder = {
        ...selectedItem,
        _id: selectedItem._id!, // forcefully assert it's defined
        bcrContent: response.data.bcr,
        // bcrContent: selectedBCR,
      };

      if (mode === 'search') {
        if (searchType === 'simple') {
          enterSimpleSearch(simpleSearchString);
        }
        if (searchType === 'enhanced') {
          enterEnhancedSearch();
        }
        if (searchType === 'bcrs-not-signed') {
          dispatch(fetchBCRsNotSigned());
        }
      }
      if (mode === 'explorer') {
        dispatch(updateItem(file));
      }

      dispatch(fetchNotifications());

      setOpenSignModal(false);
      toast.success(response.data.message || "Signature saved successfully");
      setLoading(false);
    } catch (error) {
      console.error("Error signing:", error);
      toast.error("Error submitting signature");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal opened={openSignModal} onClose={() => setOpenSignModal(false)} title={
    <div className="flex flex-col gap-2">
      <span className="mb-1">Signing BCR:</span>
      <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;File Name: &nbsp;<span className="font-bold">{selectedItem?.name}</span></span>
      <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;BCR Title: &nbsp;<span className="font-bold">{selectedBCR?.title}</span></span>
      <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Resolution Number: &nbsp;<span className="font-bold">{selectedBCR?.resolutionNumber}</span></span>
    </div>
  }  centered>
          <div style={{ border: "1px solid #ccc", padding: 8 }}>
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
        {/* <div style={{ border: "1px solid #ccc", padding: 8 }}>
          <SignatureCanvas
            ref={sigCanvas}
            penColor="black"
            canvasProps={{ width: 400, height: 150, className: "signature-canvas" }}
          />
        </div> */}
        {isSigning && (
            <Group mt="md">
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
