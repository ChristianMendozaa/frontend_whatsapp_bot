"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FileText, Loader2, Upload, Trash2, CheckCircle2 } from "lucide-react";

export default function KnowledgeAdmin() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // Reemplazar con la variable de entorno real en producción
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  const fetchDocuments = async () => {
    const { data } = await supabase.from("documents").select("*").order("created_at", { ascending: false });
    if (data) setDocuments(data);
  };

  useEffect(() => {
    fetchDocuments();
    
    // Suscribirse también a los cambios para ver cuando el vectorizado termina (processing -> complete)
    const sub = supabase
      .channel('public:documents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, () => {
        fetchDocuments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${backendUrl}/api/rag/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      setFile(null);
      await fetchDocuments();
      alert("Se subió y procesó el documento con éxito.");
    } catch (error) {
      console.error(error);
      alert("Hubo un error vectorizando el documento PDF.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, fileName: string) => {
    if (!confirm(`¿Estás seguro que deseas eliminar TODO el conocimiento de "${fileName}"?`)) return;

    try {
      const response = await fetch(`${backendUrl}/api/rag/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      await fetchDocuments();
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar el documento.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6 overflow-y-auto w-full">
      <div className="max-w-4xl mx-auto w-full">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Base de Conocimiento IA (RAG)</h1>
        <p className="text-gray-500 mb-8">Sube documentos PDF para que el Agente LLM pueda usarlos al responder preguntas en WhatsApp.</p>

        {/* Upload Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Añadir Nuevo Conocimiento</h2>
          <form onSubmit={handleUpload} className="flex items-center space-x-4">
            <input 
              type="file" 
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={isUploading}
              className="flex-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-colors"
            />
            <button 
              type="submit" 
              disabled={!file || isUploading}
              className={`flex items-center px-6 py-2 rounded-full font-medium transition-colors ${!file || isUploading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#00a884] hover:bg-[#008f6f] text-white shadow-md'}`}
            >
              {isUploading ? <Loader2 size={18} className="animate-spin mr-2" /> : <Upload size={18} className="mr-2" />}
              {isUploading ? "Procesando & Vectorizando..." : "Ingresar Conocimiento"}
            </button>
          </form>
        </div>

        {/* Document List */}
        <h2 className="text-lg font-medium text-gray-800 mb-4">Documentos Ingestados</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {documents.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
               No hay documentos subidos actualmente. El bot no tiene contexto adicional.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre del Archivo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Ingestión</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText size={18} className="text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">{doc.filename}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {doc.status === 'processing' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                           <Loader2 size={12} className="animate-spin mr-1" /> Procesando
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                           <CheckCircle2 size={12} className="mr-1" /> Vectorizado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                         onClick={() => handleDelete(doc.id, doc.filename)}
                         className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50"
                      >
                         <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
