import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import {
  Menu,
  X,
  LogOut,
  Home,
  Beef,
  Grid3x3,
  Apple,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  FileText,
  Users,
} from "lucide-react";
import AnimalsPage from "./AnimalsPage";
import PensPage from "./PensPage";
import FoodsPage from "./FoodsPage";
import CostsPage from "./CostsPage";
import SalesPage from "./SalesPage";
import CashFlowPage from "./CashFlowPage";
import ReportsPage from "./ReportsPage";
import UsersPage from "./UsersPage";

type Page =
  | "home"
  | "animals"
  | "pens"
  | "foods"
  | "costs"
  | "sales"
  | "cashflow"
  | "reports"
  | "users";

export default function Dashboard() {
  const { profile, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    { name: "Início", icon: Home, page: "home" as Page },
    { name: "Animais", icon: Beef, page: "animals" as Page },
    { name: "Baias", icon: Grid3x3, page: "pens" as Page },
    { name: "Alimentos", icon: Apple, page: "foods" as Page },
    { name: "Custos", icon: DollarSign, page: "costs" as Page },
    { name: "Vendas", icon: ShoppingCart, page: "sales" as Page },
    { name: "Fluxo de Caixa", icon: TrendingUp, page: "cashflow" as Page },
    { name: "Relatórios", icon: FileText, page: "reports" as Page },
  ];

  // Todos os usuários podem acessar a página de usuários
  navigation.push({ name: "Usuários", icon: Users, page: "users" as Page });

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-green-600">CTE Manager</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">{profile?.full_name}</p>
              <p className="text-xs text-gray-500 capitalize">
                {profile?.role}
              </p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.page;
              return (
                <button
                  key={item.page}
                  onClick={() => {
                    setCurrentPage(item.page);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? "bg-green-50 text-green-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : ""
        }`}
      >
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              {navigation.find((n) => n.page === currentPage)?.name}
            </h1>
            <div className="w-6"></div>
          </div>
        </header>

        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {currentPage === "home" && <HomePage />}
            {currentPage === "animals" && <AnimalsPage />}
            {currentPage === "pens" && <PensPage />}
            {currentPage === "foods" && <FoodsPage />}
            {currentPage === "costs" && <CostsPage />}
            {currentPage === "sales" && <SalesPage />}
            {currentPage === "cashflow" && <CashFlowPage />}
            {currentPage === "reports" && <ReportsPage />}
            {currentPage === "users" && <UsersPage />}
          </div>
        </main>
      </div>
    </div>
  );
}

function HomePage() {
  const [stats, setStats] = useState({
    activeAnimals: 0,
    occupiedPens: 0,
    monthlyCosts: 0,
    monthlySales: 0,
    loading: true,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

      // Contar animais ativos
      const { count: animalsCount, error: animalsError } = await supabase
        .from("animals")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      if (animalsError) throw animalsError;

      // Contar baias ocupadas
      const { data: pens, error: pensError } = await supabase
        .from("pens")
        .select("id, current_occupancy")
        .eq("active", true);

      if (pensError) throw pensError;
      const occupiedPens =
        pens?.filter((p) => p.current_occupancy > 0).length || 0;

      // Calcular custos do mês
      const { data: costs, error: costsError } = await supabase
        .from("costs")
        .select("amount")
        .gte("date", startOfMonth)
        .lte("date", endOfMonth);

      if (costsError) throw costsError;
      const monthlyCosts =
        costs?.reduce((sum, cost) => sum + Number(cost.amount), 0) || 0;

      // Calcular vendas do mês
      const { data: sales, error: salesError } = await supabase
        .from("sales")
        .select("sale_price")
        .gte("sale_date", startOfMonth)
        .lte("sale_date", endOfMonth);

      if (salesError) throw salesError;
      const monthlySales =
        sales?.reduce((sum, sale) => sum + Number(sale.sale_price), 0) || 0;

      setStats({
        activeAnimals: animalsCount || 0,
        occupiedPens,
        monthlyCosts,
        monthlySales,
        loading: false,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Animais Ativos"
          value={stats.loading ? "..." : stats.activeAnimals.toString()}
          icon={Beef}
          color="blue"
        />
        <StatCard
          title="Baias Ocupadas"
          value={stats.loading ? "..." : stats.occupiedPens.toString()}
          icon={Grid3x3}
          color="green"
        />
        <StatCard
          title="Custo Total Mês"
          value={stats.loading ? "..." : formatCurrency(stats.monthlyCosts)}
          icon={DollarSign}
          color="red"
        />
        <StatCard
          title="Vendas do Mês"
          value={stats.loading ? "..." : formatCurrency(stats.monthlySales)}
          icon={ShoppingCart}
          color="emerald"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Bem-vindo ao CTE Manager
        </h2>
        <p className="text-gray-600">
          Sistema completo de gestão para Centro de Terminação de Bovinos. Use o
          menu lateral para navegar entre os módulos.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: any;
  color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 rounded-lg ${
            colorClasses[color as keyof typeof colorClasses]
          }`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
