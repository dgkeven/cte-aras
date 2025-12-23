import { useState, useEffect } from "react";
import { supabase, Pen } from "../lib/supabase";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function PensPage() {
  const [pens, setPens] = useState<Pen[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPen, setEditingPen] = useState<Pen | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    loadPens();
  }, []);

  const loadPens = async () => {
    try {
      const { data, error } = await supabase
        .from("pens")
        .select("*")
        .order("name");

      if (error) throw error;
      setPens(data || []);
    } catch (error) {
      console.error("Error loading pens:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta baia?")) return;

    try {
      const { error } = await supabase.from("pens").delete().eq("id", id);

      if (error) throw error;
      loadPens();
    } catch (error) {
      console.error("Error deleting pen:", error);
      alert("Erro ao excluir baia");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Baias / Piquetes</h2>
          <p className="text-gray-600">Gerencie as baias e piquetes</p>
        </div>
        <button
          onClick={() => {
            setEditingPen(null);
            setShowModal(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Baia</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pens.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                Nenhuma baia cadastrada
              </div>
            ) : (
              pens.map((pen) => (
                <div
                  key={pen.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {pen.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {profile?.role === "admin" && (
                        <>
                          <button
                            onClick={() => {
                              setEditingPen(pen);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(pen.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Capacidade:</span>
                      <span className="font-medium">
                        {pen.capacity} animais
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ocupação:</span>
                      <span className="font-medium">
                        {pen.current_occupancy} animais
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Custo Diário:</span>
                      <span className="font-medium">
                        R$ {pen.daily_cost.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          pen.active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {pen.active ? "Ativa" : "Inativa"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-green-600 h-full transition-all"
                        style={{
                          width: `${Math.min(
                            (pen.current_occupancy / pen.capacity) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {pen.capacity > 0
                        ? Math.round(
                            (pen.current_occupancy / pen.capacity) * 100
                          )
                        : 0}
                      % ocupada
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showModal && (
        <PenModal
          pen={editingPen}
          onClose={() => {
            setShowModal(false);
            setEditingPen(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingPen(null);
            loadPens();
          }}
        />
      )}
    </div>
  );
}

function PenModal({
  pen,
  onClose,
  onSave,
}: {
  pen: Pen | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: pen?.name || "",
    capacity: pen?.capacity || 0,
    current_occupancy: pen?.current_occupancy || 0,
    daily_cost: pen?.daily_cost || 0,
    active: pen?.active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (pen) {
        const { error } = await supabase
          .from("pens")
          .update(formData)
          .eq("id", pen.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("pens").insert([formData]);
        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error("Error saving pen:", error);
      alert("Erro ao salvar baia");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold">
            {pen ? "Editar Baia" : "Nova Baia"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ex: Baia 1, Piquete A"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacidade *
            </label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ocupação Atual
            </label>
            <input
              type="number"
              value={formData.current_occupancy}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  current_occupancy: parseInt(e.target.value),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custo Diário (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.daily_cost}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  daily_cost: parseFloat(e.target.value),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.checked })
                }
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Baia Ativa
              </span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
