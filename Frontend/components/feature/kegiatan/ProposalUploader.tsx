"use client";

import { useState, useRef } from "react";
import Icon from "@/components/ui/Icon";
import { useKegiatanStore, type Kegiatan, type ProposalFile } from "@/stores/kegiatan.store";
import Button from "@/components/ui/Button";
import { formatSize, formatDate } from "./utils";

export default function ProposalUploader({ kegiatan }: { kegiatan: Kegiatan }) {
  const { setProposal } = useKegiatanStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Ukuran file maksimal 5MB"); return; }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const pf: ProposalFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        data: reader.result as string,
        uploadedAt: new Date().toISOString(),
      };
      setProposal(kegiatan.id, pf);
      setUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const downloadFile = () => {
    if (!kegiatan.proposal) return;
    const a = document.createElement("a");
    a.href = kegiatan.proposal.data;
    a.download = kegiatan.proposal.name;
    a.click();
  };

  return (
    <div className="mt-3 pt-3 border-t border-outline-variant/10">
      <span className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-2">Proposal</span>

      {kegiatan.proposal ? (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/5 border border-secondary/15">
          <div className="w-10 h-10 rounded-lg bg-secondary/15 flex items-center justify-center shrink-0">
            <Icon name="description" filled className="text-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary truncate">{kegiatan.proposal.name}</p>
            <p className="text-[10px] text-on-surface-variant/50">{formatSize(kegiatan.proposal.size)} • {formatDate(kegiatan.proposal.uploadedAt)}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="icon" size="icon" onClick={downloadFile} title="Download">
              <Icon name="download" size="sm" />
            </Button>
            <Button variant="icon" size="icon" onClick={() => setProposal(kegiatan.id, null)} className="hover:bg-red-50 text-red-400 hover:text-red-500" title="Hapus">
              <Icon name="delete" size="sm" />
            </Button>
          </div>
        </div>
      ) : (
        <Button size="none" variant="none" onClick={() => fileRef.current?.click()}
          className="w-full font-medium p-4 rounded-xl border-2 border-dashed border-outline-variant/25 hover:border-secondary/40 hover:bg-secondary/5 flex flex-col items-center justify-center gap-2 transition-all group cursor-pointer"
          disabled={uploading}>
          {uploading ? (
            <div className="w-6 h-6 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
          ) : (
            <>
              <Icon name="cloud_upload" className="text-2xl text-on-surface-variant/30 group-hover:text-secondary transition-colors" />
              <span className="text-xs text-on-surface-variant/50 group-hover:text-secondary/80 transition-colors">Upload Proposal (PDF, DOC, max 5MB)</span>
            </>
          )}
        </Button>
      )}
      <input ref={fileRef} type="file" onChange={handleFile} accept=".pdf,.doc,.docx,.ppt,.pptx" className="hidden" />
    </div>
  );
}
