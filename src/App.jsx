import { useEffect, useState, useRef } from "react";
import { supabase } from "./lib/supabase";

export default function App() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [folderName, setFolderName] = useState(localStorage.getItem("activeFolder") || "defaultFolder");

  const fileInputRef = useRef(null);
  const bucketName = "photos";

  // Supabase test
  useEffect(() => {
    async function testConnection() {
      console.log("🔌 Supabase bağlantısı test ediliyor...");
      const { data, error } = await supabase.from("photos").select("*");
      console.log("Test sonucu:", data, error);
    }
    testConnection();
  }, []);

  // localStorage aktif klasör dinleme
  useEffect(() => {
    const handleStorageChange = () => {
      const activeFolder = localStorage.getItem("activeFolder");
      if (activeFolder) {
        setFolderName(activeFolder);
        console.log("Aktif klasör:", activeFolder);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    if (folderName) console.log("Aktif klasör:", folderName);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, [folderName]);

  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    setSuccess(false);

    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${folderName}/${fileName}`;

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    setUploading(false);

    if (!error) {
      setSuccess(true);
      setFile(null);
      console.log(`✅ Dosya yüklendi: ${filePath}`);
    } else {
      alert("Yükleme hatası: " + error.message);
      console.error("❌ Yükleme hatası:", error);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", textAlign: "center" }}>
      <h2>Düğün Fotoğraf/Video Yükleme</h2>

      {/* Yükleme ikonu */}
      <div
        onClick={() => fileInputRef.current.click()}
        style={{
          width: 160,
          height: 160,
          margin: "30px auto 10px",
          borderRadius: 16,
          backgroundColor: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          border: "2px dashed #bbb",
        }}
      >
        <span style={{ fontSize: 50, color: "#888" }}>📷</span>
      </div>

      <p style={{ marginTop: 5, fontSize: 16, color: "#444" }}>
        Fotoğraf / Video Yükle
      </p>

      {/* Gizli file input */}
      <input
        type="file"
        accept="image/*,video/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={(e) => setFile(e.target.files[0])}
      />

      {/* Seçilen dosya adı */}
      {file && (
        <p style={{ marginTop: 15 }}>
          Seçilen: <b>{file.name}</b>
        </p>
      )}

      {/* Yükle Butonu */}
      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          fontSize: 16,
          cursor: "pointer",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: 8,
        }}
      >
        {uploading ? "Yükleniyor..." : "Yükle"}
      </button>

      {success && (
        <p style={{ color: "green", marginTop: 20 }}>
          ✔️ Yüklendi! Teşekkürler.
        </p>
      )}
    </div>
  );
}
