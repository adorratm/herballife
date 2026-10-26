"use client";

import { useEffect, useState } from "react";

export type WhatsAppPopupEventDetail = {
  visible: boolean;
  /** Popup balonu yüksekliği (px); görünür değilse 0 */
  heightPx?: number;
};

export type WhatsAppFabLayout = {
  popupVisible: boolean;
  popupHeightPx: number;
};

/** WhatsApp tanıtım balonu — ScrollToTop FAB dinamik ofset için */
export function useWhatsAppFabState(): WhatsAppFabLayout {
  const [state, setState] = useState<WhatsAppFabLayout>({
    popupVisible: false,
    popupHeightPx: 0,
  });

  useEffect(() => {
    function onPopup(e: Event) {
      const detail = (e as CustomEvent<WhatsAppPopupEventDetail>).detail;
      const visible = Boolean(detail?.visible);
      setState({
        popupVisible: visible,
        popupHeightPx: visible ? Math.max(0, Number(detail?.heightPx) || 0) : 0,
      });
    }
    window.addEventListener("herbalkapida:wa-popup", onPopup);
    return () => window.removeEventListener("herbalkapida:wa-popup", onPopup);
  }, []);

  return state;
}
