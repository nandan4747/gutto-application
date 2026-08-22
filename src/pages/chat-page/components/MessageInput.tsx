import { useState, useRef, useEffect } from "react";
import { colorScheme } from "../../../theme/colorScheme";
import { Send, Paperclip, X, FileText } from "lucide-react";

// Matches the backend's multer limit (see chatRoutes.ts) — checking here
// means an oversized file gets rejected instantly instead of after a
// failed round trip to the server.
const MAX_FILE_SIZE = 25 * 1024 * 1024;

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface Props {
  onSend: (text: string) => void;
  onSendFile: (file: File, caption: string) => void;
}

export default function MessageInput({ onSend, onSendFile }: Props) {
  const [text, setText] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Free the object URL whenever it's replaced or the component unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const clearAttachment = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setAttachedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFilePicked = (file: File | undefined) => {
    setError(null);
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError("File too large (max 25MB)");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setAttachedFile(file);
    setPreviewUrl(
      file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    );
  };

  const handleSend = () => {
    const trimmed = text.trim();

    if (attachedFile) {
      onSendFile(attachedFile, trimmed);
      clearAttachment();
      setText("");
      return;
    }

    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <div
      style={{
        borderTop: `1px solid ${colorScheme.border}`,
      }}
    >
      {error && (
        <div
          style={{
            padding: "6px 16px",
            color: "#e53e3e",
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}

      {attachedFile && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 16px 0",
          }}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: colorScheme.backgroundSecondary,
              borderRadius: 10,
              padding: previewUrl ? 4 : "8px 12px",
            }}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={attachedFile.name}
                style={{
                  width: 48,
                  height: 48,
                  objectFit: "cover",
                  borderRadius: 8,
                  display: "block",
                }}
              />
            ) : (
              <FileText size={20} color={colorScheme.textSecondary} />
            )}
            <div style={{ maxWidth: 180 }}>
              <div
                style={{
                  fontSize: 12,
                  color: colorScheme.text,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {attachedFile.name}
              </div>
              <div style={{ fontSize: 11, color: colorScheme.textSecondary }}>
                {formatFileSize(attachedFile.size)}
              </div>
            </div>
            <button
              onClick={clearAttachment}
              aria-label="Remove attachment"
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                width: 20,
                height: 20,
                borderRadius: "50%",
                border: "none",
                background: "#e53e3e",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", padding: 12 }}>
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => handleFilePicked(e.target.files?.[0])}
          style={{ display: "none" }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach file"
          style={{
            marginRight: 8,
            padding: "0 14px",
            background: "transparent",
            color: colorScheme.textSecondary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `1px solid ${colorScheme.border}`,
            borderRadius: 16,
            cursor: "pointer",
          }}
        >
          <Paperclip size={20} />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder={attachedFile ? "Add a caption..." : "Type a message..."}
          style={{
            flex: 1,
            padding: "14px 16px",
            borderRadius: 8,
            border: `1px solid ${colorScheme.border}`,
            background: colorScheme.background,
            color: colorScheme.text,
          }}
        />
        <button
          style={{
            marginLeft: 8,
            padding: "10px 12px",
            background: colorScheme.backgroundTertiary,

            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            borderRadius: "50%",
            cursor: "pointer",
          }}
          onClick={handleSend}
          disabled={!attachedFile && !text.trim()}
        >
          <Send fill={colorScheme.primary} stroke={colorScheme.primary} />
        </button>
      </div>
    </div>
  );
}
