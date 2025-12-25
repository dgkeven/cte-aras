import { useState, useEffect } from "react";
import { supabase, Animal, Pen } from "../lib/supabase";
import { Plus, Search, Filter, Edit, Trash2, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function AnimalsPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [pens, setPens] = useState<Pen[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBreed, setFilterBreed] = useState("");
  const [filterSex, setFilterSex] = useState("");
  const [filterStatus, setFilterStatus] = useState("active");
  const { profile } = useAuth();

  useEffect(() => {
    loadAnimals();
    loadPens();
  }, []);

  const loadAnimals = async () => {
    try {
      const { data, error } = await supabase
        .from("animals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnimals(data || []);
    } catch (error) {
      console.error("Error loading animals:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPens = async () => {
    try {
      const { data, error } = await supabase
        .from("pens")
        .select("*")
        .eq("active", true)
        .order("name");

      if (error) throw error;
      setPens(data || []);
    } catch (error) {
      console.error("Error loading pens:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este animal?")) return;

    try {
      const { error } = await supabase.from("animals").delete().eq("id", id);

      if (error) throw error;
      loadAnimals();
    } catch (error) {
      console.error("Error deleting animal:", error);
      alert("Erro ao excluir animal");
    }
  };

  const breeds = [...new Set(animals.map((a) => a.breed))];

  const filteredAnimals = animals.filter((animal) => {
    const matchesSearch =
      animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.identification_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesBreed = !filterBreed || animal.breed === filterBreed;
    const matchesSex = !filterSex || animal.sex === filterSex;
    const matchesStatus = !filterStatus || animal.status === filterStatus;

    return matchesSearch && matchesBreed && matchesSex && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Animais</h2>
          <p className="text-gray-600">Gerencie o cadastro de animais</p>
        </div>
        <button
          onClick={() => {
            setEditingAnimal(null);
            setShowModal(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Animal</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar animal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterBreed}
            onChange={(e) => setFilterBreed(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Todas as raças</option>
            {breeds.map((breed) => (
              <option key={breed} value={breed}>
                {breed}
              </option>
            ))}
          </select>

          <select
            value={filterSex}
            onChange={(e) => setFilterSex(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Todos os sexos</option>
            <option value="male">Macho</option>
            <option value="female">Fêmea</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="sold">Vendido</option>
            <option value="dead">Morto</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Nome
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Raça
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Sexo
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Peso Atual
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAnimals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      Nenhum animal encontrado
                    </td>
                  </tr>
                ) : (
                  filteredAnimals.map((animal) => (
                    <tr
                      key={animal.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm">
                        {animal.identification_number}
                      </td>
                      <td className="py-3 px-4 font-medium">{animal.name}</td>
                      <td className="py-3 px-4 text-sm">{animal.breed}</td>
                      <td className="py-3 px-4 text-sm">
                        {animal.sex === "male" ? "Macho" : "Fêmea"}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {animal.current_weight} kg
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            animal.status === "active"
                              ? "bg-green-100 text-green-700"
                              : animal.status === "sold"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {animal.status === "active"
                            ? "Ativo"
                            : animal.status === "sold"
                            ? "Vendido"
                            : "Morto"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingAnimal(animal);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(animal.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <AnimalModal
          animal={editingAnimal}
          pens={pens}
          animals={animals}
          onClose={() => {
            setShowModal(false);
            setEditingAnimal(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingAnimal(null);
            loadAnimals();
          }}
        />
      )}
    </div>
  );
}

function AnimalModal({
  animal,
  pens,
  animals,
  onClose,
  onSave,
}: {
  animal: Animal | null;
  pens: Pen[];
  animals: Animal[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: animal?.name || "",
    identification_number: animal?.identification_number || "",
    breed: animal?.breed || "",
    sex: animal?.sex || "male",
    castrated: animal?.castrated || false,
    father_id: animal?.father_id || "",
    mother_id: animal?.mother_id || "",
    photo_url: animal?.photo_url || "",
    pen_id: animal?.pen_id || "",
    entry_date: animal?.entry_date || new Date().toISOString().split("T")[0],
    entry_weight: animal?.entry_weight || 0,
    current_weight: animal?.current_weight || 0,
    status: animal?.status || "active",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        ...formData,
        father_id: formData.father_id || null,
        mother_id: formData.mother_id || null,
        pen_id: formData.pen_id || null,
        photo_url: formData.photo_url || null,
      };

      if (animal) {
        const { error } = await supabase
          .from("animals")
          .update(data)
          .eq("id", animal.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("animals").insert([data]);
        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error("Error saving animal:", error);
      alert("Erro ao salvar animal");
    } finally {
      setSaving(false);
    }
  };

  // Filtrar animais disponíveis para seleção como pai/mãe
  // Excluir o animal atual se estiver editando (para evitar referências circulares)
  const maleAnimals = animals.filter(
    (a) => a.sex === "male" && (!animal || a.id !== animal.id)
  );
  const femaleAnimals = animals.filter(
    (a) => a.sex === "female" && (!animal || a.id !== animal.id)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h3 className="text-xl font-semibold">
            {animal ? "Editar Animal" : "Novo Animal"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Identificação *
              </label>
              <input
                type="text"
                value={formData.identification_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    identification_number: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raça *
              </label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) =>
                  setFormData({ ...formData, breed: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: Nelore, Angus, etc"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sexo *
              </label>
              <select
                value={formData.sex}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sex: e.target.value as "male" | "female",
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="male">Macho</option>
                <option value="female">Fêmea</option>
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.castrated}
                  onChange={(e) =>
                    setFormData({ ...formData, castrated: e.target.checked })
                  }
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Castrado
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pai
              </label>
              <select
                value={formData.father_id}
                onChange={(e) =>
                  setFormData({ ...formData, father_id: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Selecione o pai</option>
                {maleAnimals.length === 0 ? (
                  <option value="" disabled>
                    Nenhum animal macho cadastrado
                  </option>
                ) : (
                  maleAnimals.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.identification_number})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mãe
              </label>
              <select
                value={formData.mother_id}
                onChange={(e) =>
                  setFormData({ ...formData, mother_id: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Selecione a mãe</option>
                {femaleAnimals.length === 0 ? (
                  <option value="" disabled>
                    Nenhum animal fêmea cadastrado
                  </option>
                ) : (
                  femaleAnimals.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.identification_number})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as Animal["status"],
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="active">Ativo</option>
                <option value="sold">Vendido</option>
                <option value="dead">Morto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Baia
              </label>
              <select
                value={formData.pen_id}
                onChange={(e) =>
                  setFormData({ ...formData, pen_id: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Selecione a baia</option>
                {pens.map((pen) => (
                  <option key={pen.id} value={pen.id}>
                    {pen.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Entrada *
              </label>
              <input
                type="date"
                value={formData.entry_date}
                onChange={(e) =>
                  setFormData({ ...formData, entry_date: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso de Entrada (kg) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.entry_weight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    entry_weight: parseFloat(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso Atual (kg) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.current_weight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    current_weight: parseFloat(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL da Foto
              </label>
              <input
                type="url"
                value={formData.photo_url}
                onChange={(e) =>
                  setFormData({ ...formData, photo_url: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="https://exemplo.com/foto.jpg"
              />
            </div>
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
