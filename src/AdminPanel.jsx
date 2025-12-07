import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function AdminPanel() {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [activeFolder, setActiveFolder] = useState(localStorage.getItem("activeFolder") || "");
  const [newFolderName, setNewFolderName] = useState("");
  const [folderFiles, setFolderFiles] = useState([]);
  const [folderToView, setFolderToView] = useState("");

  const bucketName = "photos";

  const fetchFolders = async () => {
    const { data, error } = await supabase.storage.from(bucketName).list("", { limit: 100 });
    if (error) return console.error("Klasör çekme hatası:", error);
    const folderNames = [...new Set(data.map(item => item.name.split("/")[0]))];
    setFolders(folderNames);
  };

  const createFolder = async () => {
    if (!newFolderName) return;

    // Klasör adını temizle ve özel karakterleri _ ile değiştir
    const cleanFolderName = newFolderName.trim().replace(/[^a-zA-Z0-9-_]/g, "_");

    const { error } = await supabase.storage.from(bucketName).upload(`${cleanFolderName}/.keep`, new Blob([""]));
    if (error) return alert("Klasör oluşturma hatası: " + error.message);

    setNewFolderName("");
    fetchFolders();
  };

  const assignFolder = () => {
    if (!selectedFolder) return alert("Önce bir klasör seçin!");
    localStorage.setItem("activeFolder", selectedFolder);
    setActiveFolder(selectedFolder);
    alert(`✅ ${selectedFolder} klasörü artık aktif!`);
  };

  const fetchFolderFiles = async (folderName) => {
    if (!folderName) return setFolderFiles([]);
    const { data, error } = await supabase.storage.from(bucketName).list(folderName, { limit: 100 });
    if (error) return console.error("Klasör içeriği çekme hatası:", error);

    const files = data.filter(file => file.name !== ".keep");

    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        const { data: urlData, error: urlError } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(`${folderName}/${file.name}`, 60 * 60);
        if (urlError) console.error("Signed URL hatası:", urlError);
        return { ...file, publicUrl: urlData.signedUrl };
      })
    );

    setFolderFiles(filesWithUrls);
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    fetchFolderFiles(folderToView);
  }, [folderToView]);

  const downloadFile = (file) => {
    const link = document.createElement("a");
    link.href = file.publicUrl;
    link.download = file.name;
    link.click();
  };

  const downloadAllAsZip = async () => {
    if (!folderToView || folderFiles.length === 0) return alert("Önce klasörü seçin ve içerik gelsin.");

    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    for (const file of folderFiles) {
      const res = await fetch(file.publicUrl);
      const blob = await res.blob();
      zip.file(file.name, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `${folderToView}.zip`;
    link.click();
  };

  return (
    <div style={{ padding: 10, fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center" }}>Admin Paneli</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", justifyContent: "center" }}>
        <input
          type="text"
          placeholder="Yeni düğün klasör adı"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          style={{ flexGrow: 1, minWidth: 150, padding: 10, fontSize: 14, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <button
          onClick={createFolder}
          style={{ padding: "10px 15px", borderRadius: 6, border: "none", backgroundColor: "#007bff", color: "#fff", fontSize: 14, cursor: "pointer" }}
        >
          Klasör Oluştur
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 20 }}>
        <select
          value={selectedFolder}
          onChange={(e) => setSelectedFolder(e.target.value)}
          style={{ padding: 10, fontSize: 14, borderRadius: 6, border: "1px solid #ccc", minWidth: 200 }}
        >
          <option value="">Klasör seçin</option>
          {folders.map((folder) => (
            <option key={folder} value={folder}>{folder}</option>
          ))}
        </select>
        <button
          onClick={assignFolder}
          style={{ padding: "10px 20px", fontSize: 14, borderRadius: 6, backgroundColor: "#28a745", color: "#fff", border: "none", cursor: "pointer" }}
        >
          Aktif Klasör Olarak Ata
        </button>
      </div>

      {activeFolder && (
        <p style={{ textAlign: "center" }}>
          Aktif Klasör: <b>{activeFolder}</b>{" "}
          <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", backgroundColor: "green" }}></span>
        </p>
      )}

      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 20 }}>
        <select
          value={folderToView}
          onChange={(e) => setFolderToView(e.target.value)}
          style={{ padding: 10, fontSize: 14, borderRadius: 6, border: "1px solid #ccc", minWidth: 200 }}
        >
          <option value="">İçeriğini görmek istediğiniz klasörü seçin</option>
          {folders.map((folder) => (
            <option key={folder} value={folder}>{folder}</option>
          ))}
        </select>
      </div>

      {folderFiles.length > 0 && (
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <button
            onClick={downloadAllAsZip}
            style={{ padding: "10px 20px", fontSize: 14, borderRadius: 6, backgroundColor: "#ff6600", color: "#fff", border: "none", cursor: "pointer" }}
          >
            Tümünü İndir (ZIP)
          </button>
          <p style={{ fontSize: 12, marginTop: 5 }}>
            Toplam dosya sayısı: <b>{folderFiles.length}</b>
          </p>
        </div>
      )}

      {folderFiles.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            padding: 10,
            justifyContent: "center",
          }}
        >
          {folderFiles.map((file) => (
            <div key={file.name} style={{ width: 140, textAlign: "center" }}>
              <div style={{ width: "100%", height: 140, overflow: "hidden", borderRadius: 6 }}>
                <img
                  src={file.publicUrl}
                  alt={file.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <p style={{ fontSize: 12, wordBreak: "break-word", marginTop: 5 }}>{file.name}</p>
              <button
                onClick={() => downloadFile(file)}
                style={{ marginTop: 5, padding: "5px 10px", fontSize: 12, borderRadius: 4, backgroundColor: "#007bff", color: "#fff", border: "none", cursor: "pointer" }}
              >
                İndir
              </button>
            </div>
          ))}
        </div>
      ) : folderToView ? (
        <p style={{ textAlign: "center" }}>Seçilen klasörde içerik bulunamadı.</p>
      ) : null}
    </div>
  );
}
