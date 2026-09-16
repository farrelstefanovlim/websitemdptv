"use client";

import { useState, useRef } from "react";
import Icon from "@/components/ui/Icon";
import { useKegiatanStore, type Kegiatan, type ProposalFile } from "@/stores/kegiatan.store";
import { toast } from "@/stores/toast.store";
import Button from "@/components/ui/Button";
import { formatSize, formatDate } from "./utils";

export default function ProposalUploader({ kegiatan }: { kegiatan: Kegiatan }) {
  const { setProposal } = useKegiatanStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

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
      toast.success("Proposal berhasil diunggah!");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const downloadFile = () => {
    if (!kegiatan.proposal) return;
    const a = document.createElement("a");
    a.href = kegiatan.proposal.url || kegiatan.proposal.data || "";
    a.download = kegiatan.proposal.name;
    a.click();
  };

  return (
    <div className="mt-4 pt-3.5 border-t border-outline-variant/10">
      <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 block mb-2">
        Dokumen & Proposal Kegiatan
      </span>

      {kegiatan.proposal ? (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-secondary/5 border border-secondary/20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
              <Icon name="description" filled />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-primary truncate">
                {kegiatan.proposal.name}
              </p>
              <p className="text-[10px] text-on-surface-variant/60">
                {formatSize(kegiatan.proposal.size)} •{" "}
                {kegiatan.proposal.uploadedAt
                  ? formatDate(kegiatan.proposal.uploadedAt)
                  : "Baru saja"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={downloadFile}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-container-lowest text-xs font-bold text-primary border border-outline-variant/20 hover:border-secondary/40 hover:text-secondary transition-all shadow-xs"
              title="Unduh Berkas Proposal"
            >
              <Icon name="download" size="sm" className="!text-xs" />
              <span className="hidden sm:inline">Unduh</span>
            </button>
            <button
              type="button"
              onClick={() => setProposal(kegiatan.id, null)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors"
              title="Hapus Proposal"
            >
              <Icon name="delete" size="sm" className="!text-sm" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full p-4 rounded-2xl border-2 border-dashed border-outline-variant/20 hover:border-secondary/40 hover:bg-secondary/5 flex flex-col items-center justify-center gap-1.5 transition-all group cursor-pointer bg-surface-container-lowest"
          disabled={uploading}
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
          ) : (
            <>
              <Icon
                name="cloud_upload"
                className="text-2xl text-on-surface-variant/30 group-hover:text-secondary transition-colors"
              />
              <span className="text-xs font-semibold text-on-surface-variant/60 group-hover:text-secondary transition-colors">
                Unggah Proposal Event (PDF, DOCX, maks 5MB)
              </span>
            </>
          )}
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        onChange={handleFile}
        accept=".pdf,.doc,.docx,.ppt,.pptx"
        className="hidden"
      />
    </div>
  );
}
