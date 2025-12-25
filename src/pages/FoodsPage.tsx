import { useState, useEffect } from "react";
import { supabase, Food } from "../lib/supabase";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Package,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

type StockMovement = {
  id: string;
  food_id: string;
  movement_type: "entry" | "exit";
  quantity: number;
  unit_cost: number;
  total_cost: number;
  date: string;
  notes?: string;
  created_at: string;
  foods?: Food;
};

export default function FoodsPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [selectedTab, setSelectedTab] = useState<"foods" | "movements">(
    "foods"
  );
  const { profile } = useAuth();

  useEffect(() => {
    loadFoods();
    loadMovements();
  }, []);

  const loadFoods = async () => {
    try {
      const { data, error } = await supabase
        .from("foods")
        .select("*")
        .order("name");

      if (error) throw error;
      setFoods(data || []);
    } catch (error) {
      console.error("Error loading foods:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMovements = async () => {
    try {
      const { data, error } = await supabase
        .from("stock_movements")
        .select("*, foods(*)")
        .order("date", { ascending: false })
        .limit(50);

      if (error) throw error;
      setMovements(data || []);
    } catch (error) {
      console.error("Error loading movements:", error);
    }
  };

  const handleDeleteFood = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este alimento?"))
      return;

    try {
      const { error } = await supabase.from("foods").delete().eq("id", id);

      if (error) throw error;
      loadFoods();
    } catch (error) {
      console.error("Error deleting food:", error);
      alert("Erro ao excluir alimento");
    }
  };

  const lowStockFoods = foods.filter((f) => f.current_stock <= f.min_stock);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Alimentos e Estoque
          </h2>
          <p className="text-gray-600">
            Gerencie alimentos e movimentações de estoque
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingFood(null);
              setShowFoodModal(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Alimento</span>
          </button>
          <button
            onClick={() => setShowMovementModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
          >
            <Package className="w-5 h-5" />
            <span>Nova Movimentação</span>
          </button>
        </div>
      </div>

      {lowStockFoods.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800">Estoque Baixo</h3>
              <p className="text-sm text-amber-700">
                {lowStockFoods.length}{" "}
                {lowStockFoods.length === 1
                  ? "alimento está"
                  : "alimentos estão"}{" "}
                com estoque abaixo do mínimo:{" "}
                {lowStockFoods.map((f) => f.name).join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setSelectedTab("foods")}
              className={`px-6 py-3 font-medium transition ${
                selectedTab === "foods"
                  ? "border-b-2 border-green-600 text-green-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Alimentos
            </button>
            <button
              onClick={() => setSelectedTab("movements")}
              className={`px-6 py-3 font-medium transition ${
                selectedTab === "movements"
                  ? "border-b-2 border-green-600 text-green-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Movimentações
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            </div>
          ) : selectedTab === "foods" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Nome
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Unidade
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Estoque Atual
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Estoque Mínimo
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Custo Unitário
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
                  {foods.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-8 text-gray-500"
                      >
                        Nenhum alimento cadastrado
                      </td>
                    </tr>
                  ) : (
                    foods.map((food) => (
                      <tr
                        key={food.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 font-medium">{food.name}</td>
                        <td className="py-3 px-4 text-sm">{food.unit}</td>
                        <td className="py-3 px-4 text-sm">
                          {food.current_stock.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {food.min_stock.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          R$ {food.unit_cost.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              food.current_stock <= food.min_stock
                                ? "bg-amber-100 text-amber-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {food.current_stock <= food.min_stock
                              ? "Estoque Baixo"
                              : "OK"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingFood(food);
                                setShowFoodModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteFood(food.id)}
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
          ) : (
            <div className="space-y-4">
              {movements.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Nenhuma movimentação registrada
                </div>
              ) : (
                movements.map((movement) => (
                  <div
                    key={movement.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`p-2 rounded-lg ${
                            movement.movement_type === "entry"
                              ? "bg-green-100"
                              : "bg-red-100"
                          }`}
                        >
                          {movement.movement_type === "entry" ? (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {movement.foods?.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {movement.movement_type === "entry"
                              ? "Entrada"
                              : "Saída"}{" "}
                            de {movement.quantity} {movement.foods?.unit}
                          </p>
                          {movement.notes && (
                            <p className="text-sm text-gray-500 mt-1">
                              {movement.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">
                          R$ {movement.total_cost.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(movement.date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {showFoodModal && (
        <FoodModal
          food={editingFood}
          onClose={() => {
            setShowFoodModal(false);
            setEditingFood(null);
          }}
          onSave={() => {
            setShowFoodModal(false);
            setEditingFood(null);
            loadFoods();
          }}
        />
      )}

      {showMovementModal && (
        <MovementModal
          foods={foods}
          onClose={() => setShowMovementModal(false)}
          onSave={() => {
            setShowMovementModal(false);
            loadFoods();
            loadMovements();
          }}
        />
      )}
    </div>
  );
}

function FoodModal({
  food,
  onClose,
  onSave,
}: {
  food: Food | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: food?.name || "",
    unit: food?.unit || "kg",
    current_stock: food?.current_stock || 0,
    min_stock: food?.min_stock || 0,
    unit_cost: food?.unit_cost || 0,
    active: food?.active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (food) {
        const { error } = await supabase
          .from("foods")
          .update(formData)
          .eq("id", food.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("foods").insert([formData]);
        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error("Error saving food:", error);
      alert("Erro ao salvar alimento");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold">
            {food ? "Editar Alimento" : "Novo Alimento"}
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
              placeholder="Ex: Silagem, Ração, Sal"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unidade *
            </label>
            <select
              value={formData.unit}
              onChange={(e) =>
                setFormData({ ...formData, unit: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="kg">kg</option>
              <option value="ton">Tonelada</option>
              <option value="bag">Saco</option>
              <option value="unit">Unidade</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estoque Atual
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.current_stock}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  current_stock: parseFloat(e.target.value),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estoque Mínimo
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.min_stock}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  min_stock: parseFloat(e.target.value),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custo Unitário (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.unit_cost}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  unit_cost: parseFloat(e.target.value),
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
              <span className="text-sm font-medium text-gray-700">Ativo</span>
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

function MovementModal({
  foods,
  onClose,
  onSave,
}: {
  foods: Food[];
  onClose: () => void;
  onSave: () => void;
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    food_id: "",
    movement_type: "entry" as "entry" | "exit",
    quantity: 0,
    unit_cost: 0,
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const selectedFood = foods.find((f) => f.id === formData.food_id);
  const totalCost = formData.quantity * formData.unit_cost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error: movementError } = await supabase
        .from("stock_movements")
        .insert([
          {
            ...formData,
            total_cost: totalCost,
            created_by: user?.id,
          },
        ]);

      if (movementError) throw movementError;

      const food = foods.find((f) => f.id === formData.food_id);
      if (food) {
        const newStock =
          formData.movement_type === "entry"
            ? food.current_stock + formData.quantity
            : food.current_stock - formData.quantity;

        const { error: updateError } = await supabase
          .from("foods")
          .update({ current_stock: newStock })
          .eq("id", formData.food_id);

        if (updateError) throw updateError;
      }

      onSave();
    } catch (error) {
      console.error("Error saving movement:", error);
      alert("Erro ao salvar movimentação");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold">Nova Movimentação</h3>
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
              Alimento *
            </label>
            <select
              value={formData.food_id}
              onChange={(e) => {
                const food = foods.find((f) => f.id === e.target.value);
                setFormData({
                  ...formData,
                  food_id: e.target.value,
                  unit_cost: food?.unit_cost || 0,
                });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="">Selecione o alimento</option>
              {foods.map((food) => (
                <option key={food.id} value={food.id}>
                  {food.name} (Estoque: {food.current_stock} {food.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Movimentação *
            </label>
            <select
              value={formData.movement_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  movement_type: e.target.value as "entry" | "exit",
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="entry">Entrada</option>
              <option value="exit">Saída</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade {selectedFood && `(${selectedFood.unit})`} *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantity: parseFloat(e.target.value),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custo Unitário (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.unit_cost}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  unit_cost: parseFloat(e.target.value),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              Total:{" "}
              <span className="font-semibold text-gray-800">
                R$ {totalCost.toFixed(2)}
              </span>
            </p>
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
