import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Download } from 'lucide-react';

type AnimalReport = {
  animal_id: string;
  animal_name: string;
  identification_number: string;
  breed: string;
  entry_date: string;
  current_weight: number;
  pen_name: string;
  total_food_cost: number;
  total_service_cost: number;
  total_pen_cost: number;
  total_veterinary_cost: number;
  total_other_cost: number;
  total_cost: number;
};

export default function ReportsPage() {
  const [reports, setReports] = useState<AnimalReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    if (month) {
      generateReport();
    }
  }, [month]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const startDate = `${month}-01`;
      const endDate = `${month}-31`;

      const { data: animals, error: animalsError } = await supabase
        .from('animals')
        .select(`
          id,
          name,
          identification_number,
          breed,
          entry_date,
          current_weight,
          pen_id,
          pens (name)
        `)
        .eq('status', 'active');

      if (animalsError) throw animalsError;

      const reportsData: AnimalReport[] = [];

      for (const animal of animals || []) {
        const { data: costs } = await supabase
          .from('costs')
          .select('cost_type, amount')
          .eq('animal_id', animal.id)
          .gte('date', startDate)
          .lte('date', endDate);

        const foodCost = costs?.filter(c => c.cost_type === 'food').reduce((sum, c) => sum + c.amount, 0) || 0;
        const serviceCost = costs?.filter(c => c.cost_type === 'service').reduce((sum, c) => sum + c.amount, 0) || 0;
        const penCost = costs?.filter(c => c.cost_type === 'pen').reduce((sum, c) => sum + c.amount, 0) || 0;
        const veterinaryCost = costs?.filter(c => c.cost_type === 'veterinary').reduce((sum, c) => sum + c.amount, 0) || 0;
        const otherCost = costs?.filter(c => c.cost_type === 'other').reduce((sum, c) => sum + c.amount, 0) || 0;

        reportsData.push({
          animal_id: animal.id,
          animal_name: animal.name,
          identification_number: animal.identification_number,
          breed: animal.breed,
          entry_date: animal.entry_date,
          current_weight: animal.current_weight,
          pen_name: animal.pens?.name || '-',
          total_food_cost: foodCost,
          total_service_cost: serviceCost,
          total_pen_cost: penCost,
          total_veterinary_cost: veterinaryCost,
          total_other_cost: otherCost,
          total_cost: foodCost + serviceCost + penCost + veterinaryCost + otherCost,
        });
      }

      setReports(reportsData);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'ID Animal',
      'Nome',
      'Raça',
      'Data Entrada',
      'Peso Atual',
      'Baia',
      'Custo Alimentação',
      'Custo Serviços',
      'Custo Baia',
      'Custo Veterinário',
      'Outras Despesas',
      'Total'
    ];

    const rows = reports.map(r => [
      r.identification_number,
      r.animal_name,
      r.breed,
      new Date(r.entry_date).toLocaleDateString('pt-BR'),
      r.current_weight,
      r.pen_name,
      r.total_food_cost.toFixed(2),
      r.total_service_cost.toFixed(2),
      r.total_pen_cost.toFixed(2),
      r.total_veterinary_cost.toFixed(2),
      r.total_other_cost.toFixed(2),
      r.total_cost.toFixed(2)
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-${month}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalGeneral = reports.reduce((sum, r) => sum + r.total_cost, 0);
  const totalFood = reports.reduce((sum, r) => sum + r.total_food_cost, 0);
  const totalPen = reports.reduce((sum, r) => sum + r.total_pen_cost, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Relatórios</h2>
          <p className="text-gray-600">Relatórios mensais por animal</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            onClick={exportToCSV}
            disabled={reports.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Custo Total do Mês</h3>
          <p className="text-2xl font-bold text-gray-800">R$ {totalGeneral.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total em Alimentação</h3>
          <p className="text-2xl font-bold text-blue-600">R$ {totalFood.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total em Baias</h3>
          <p className="text-2xl font-bold text-green-600">R$ {totalPen.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum dado disponível para o período selecionado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">ID</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">Animal</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">Raça</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">Peso</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">Baia</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700">Alimentação</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700">Baia</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700">Veterinário</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700">Outras</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.animal_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">{report.identification_number}</td>
                    <td className="py-3 px-2 font-medium">{report.animal_name}</td>
                    <td className="py-3 px-2">{report.breed}</td>
                    <td className="py-3 px-2">{report.current_weight} kg</td>
                    <td className="py-3 px-2">{report.pen_name}</td>
                    <td className="py-3 px-2 text-right">R$ {report.total_food_cost.toFixed(2)}</td>
                    <td className="py-3 px-2 text-right">R$ {report.total_pen_cost.toFixed(2)}</td>
                    <td className="py-3 px-2 text-right">R$ {report.total_veterinary_cost.toFixed(2)}</td>
                    <td className="py-3 px-2 text-right">R$ {report.total_other_cost.toFixed(2)}</td>
                    <td className="py-3 px-2 text-right font-semibold text-red-600">
                      R$ {report.total_cost.toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={5} className="py-3 px-2 text-right">TOTAL</td>
                  <td className="py-3 px-2 text-right">
                    R$ {reports.reduce((sum, r) => sum + r.total_food_cost, 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-right">
                    R$ {reports.reduce((sum, r) => sum + r.total_pen_cost, 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-right">
                    R$ {reports.reduce((sum, r) => sum + r.total_veterinary_cost, 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-right">
                    R$ {reports.reduce((sum, r) => sum + r.total_other_cost, 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-right text-red-600">
                    R$ {totalGeneral.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
