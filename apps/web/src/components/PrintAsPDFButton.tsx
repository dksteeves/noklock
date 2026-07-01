// @version 0.1.0 @date 2026-05-27
// "Download PDF" trigger for long-form guides (Manual, HeirGuide). Uses
// the browser's native print-to-PDF — universal, zero dependencies, works
// on every desktop + mobile browser. The user sees their normal print
// dialog with "Save as PDF" pre-selected on Chrome/Edge/Safari.
//
// The wrapping page is responsible for setting `className="print-doc …"`
// on its outer container so the print stylesheet in index.css can take
// over (light background, no chrome, expanded collapsibles).

import { useT, type Lang } from "../i18n/index.js";

const LABEL: Record<Lang, string> = {
  en:        "Download PDF",
  de:        "PDF herunterladen",
  fr:        "Télécharger en PDF",
  pt:        "Descarregar PDF",
  "zh-Hans": "下载 PDF",
  hi:        "PDF डाउनलोड करें",
};

const HINT: Record<Lang, string> = {
  en:        "Opens your browser's print dialog — pick \"Save as PDF\".",
  de:        "Öffnet den Druckdialog Ihres Browsers — wählen Sie «Als PDF speichern».",
  fr:        "Ouvre la boîte de dialogue d'impression — choisissez « Enregistrer au format PDF ».",
  pt:        "Abre a caixa de diálogo de impressão — escolha «Guardar como PDF».",
  "zh-Hans": "打开浏览器的打印对话框——选择「另存为 PDF」。",
  hi:        "आपके ब्राउज़र का प्रिंट डायलॉग खोलता है — «Save as PDF» चुनें।",
};

interface Props {
  readonly className?: string;
  readonly compact?: boolean;
}

export function PrintAsPDFButton({ className = "", compact = false }: Props): JSX.Element {
  const { lang } = useT();
  return (
    <span className={`no-print inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        className={compact ? "btn btn-secondary text-xs" : "btn btn-secondary text-sm"}
        onClick={() => { try { window.print(); } catch { /* iframe / blocked */ } }}
      >
        {LABEL[lang] ?? LABEL.en}
      </button>
      {!compact && <span className="text-[10px] text-text-muted hidden sm:inline">{HINT[lang] ?? HINT.en}</span>}
    </span>
  );
}
