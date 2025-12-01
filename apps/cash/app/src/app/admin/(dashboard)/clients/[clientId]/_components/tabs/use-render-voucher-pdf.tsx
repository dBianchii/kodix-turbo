"use client";

import { pdf } from "@react-pdf/renderer";
import { useMutation } from "@tanstack/react-query";

import {
  type VoucherPdfData,
  VoucherPdfDocument,
} from "../redemption-dialog-button/voucher-pdf";

const openPdfInNewTab = (blob: Blob) => {
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
};

const blobCache = new Map<number, Blob>();

export const useRenderVoucherPdf = () =>
  useMutation({
    mutationFn: async (pdfData: VoucherPdfData) => {
      const cached = blobCache.get(pdfData.voucher.codeNumber);
      if (cached) {
        return cached;
      }

      const blob = await pdf(<VoucherPdfDocument data={pdfData} />).toBlob();
      blobCache.set(pdfData.voucher.codeNumber, blob);
      return blob;
    },
    onSuccess: openPdfInNewTab,
  });
