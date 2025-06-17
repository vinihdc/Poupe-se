import React, { useState, useEffect } from 'react';
import { Plus, Trash2, DollarSign, Calendar, Edit3, FileText, TrendingUp, PieChart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

export default function FinancialControlApp() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear] = useState(new Date().getFullYear());
  const [transactions, setTransactions] = useState({});
  const [activeTab, setActiveTab] = useState('add');

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [type, setType] = useState('expense');

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Load data from memory on component mount
  useEffect(() => {
    // For use outside Claude.ai, uncomment the localStorage code below:
    const savedData = localStorage.getItem('financialData');
    if (savedData) {
      setTransactions(JSON.parse(savedData));
    } else {
      // Initialize with empty data structure for each month
      const initialData = {};
      months.forEach((_, index) => {
        initialData[index] = [];
      });
      setTransactions(initialData);
    }
  }, []);

  // Save to localStorage whenever transactions change
  // Uncomment for use outside Claude.ai:
  useEffect(() => {
    localStorage.setItem('financialData', JSON.stringify(transactions));
  }, [transactions]);

  const getCurrentMonthData = () => {
    return transactions[currentMonth] || [];
  };

  const addTransaction = () => {
    if (!name || !value) {
      alert('Por favor, preencha pelo menos o nome e o valor.');
      return;
    }

    const newTransaction = {
      id: Date.now(),
      name: name.trim(),
      description: description.trim(),
      value: parseFloat(value),
      type,
      date: new Date().toLocaleDateString('pt-BR')
    };

    setTransactions(prev => ({
      ...prev,
      [currentMonth]: [...(prev[currentMonth] || []), newTransaction]
    }));

    // Clear form
    setName('');
    setDescription('');
    setValue('');
    setActiveTab('list');
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => ({
      ...prev,
      [currentMonth]: prev[currentMonth].filter(t => t.id !== id)
    }));
  };

  const calculateTotals = () => {
    const monthData = getCurrentMonthData();
    const income = monthData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.value, 0);
    const expenses = monthData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.value, 0);
    return { income, expenses, balance: income - expenses };
  };

  const getYearlyData = () => {
    return months.map((month, index) => {
      const monthData = transactions[index] || [];
      const income = monthData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.value, 0);
      const expenses = monthData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.value, 0);
      return {
        month: month.substring(0, 3),
        receitas: income,
        despesas: expenses,
        economia: income - expenses
      };
    });
  };

  const getPieChartData = () => {
    const { income, expenses } = calculateTotals();
    if (income === 0 && expenses === 0) return [];

    return [
      { name: 'Receitas', value: income, color: '#10b981' },
      { name: 'Despesas', value: expenses, color: '#ef4444' }
    ];
  };

  const getCategoryData = () => {
    const monthData = getCurrentMonthData();
    const categories = {};

    monthData.forEach(transaction => {
      const category = transaction.type === 'income' ? 'Receitas' : 'Despesas';
      if (!categories[category]) {
        categories[category] = {};
      }

      const key = transaction.name;
      if (!categories[category][key]) {
        categories[category][key] = 0;
      }
      categories[category][key] += transaction.value;
    });

    const result = [];
    Object.keys(categories).forEach(type => {
      Object.keys(categories[type]).forEach(item => {
        result.push({
          categoria: item,
          valor: categories[type][item],
          tipo: type
        });
      });
    });

    return result.sort((a, b) => b.valor - a.valor).slice(0, 10);
  };

  const { income, expenses, balance } = calculateTotals();
  const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
            <DollarSign className="text-green-400" />
            Controle Financeiro
          </h1>

          {/* Month Selector */}
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="text-blue-400" />
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(Number(e.target.value))}
              className="px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>
                  {month} {currentYear}
                </option>
              ))}
            </select>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
              <h3 className="text-green-300 font-semibold">Receitas</h3>
              <p className="text-2xl font-bold text-green-400">
                R$ {income.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
              <h3 className="text-red-300 font-semibold">Despesas</h3>
              <p className="text-2xl font-bold text-red-400">
                R$ {expenses.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <div className={`${balance >= 0 ? 'bg-blue-900/30 border-blue-700' : 'bg-orange-900/30 border-orange-700'} border rounded-lg p-4`}>
              <h3 className={`${balance >= 0 ? 'text-blue-300' : 'text-orange-300'} font-semibold`}>Saldo</h3>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                R$ {balance.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4">
              <h3 className="text-purple-300 font-semibold">Taxa de Economia</h3>
              <p className="text-2xl font-bold text-purple-400">
                {savingsRate}%
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 mb-6">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('add')}
              className={`px-6 py-4 font-semibold flex items-center gap-2 ${activeTab === 'add'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              <Plus size={20} />
              Adicionar
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-6 py-4 font-semibold flex items-center gap-2 ${activeTab === 'list'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              <FileText size={20} />
              Transações
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`px-6 py-4 font-semibold flex items-center gap-2 ${activeTab === 'charts'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              <TrendingUp size={20} />
              Análises
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'add' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Edit3 size={20} />
                  Nova Transação
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Salário, Aluguel, Compras..."
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Valor *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="0,00"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalhes adicionais sobre a transação..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="income"
                        checked={type === 'income'}
                        onChange={(e) => setType(e.target.value)}
                        className="text-green-400 focus:ring-green-500 bg-gray-700 border-gray-600"
                      />
                      <span className="text-green-400 font-medium">Receita</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="expense"
                        checked={type === 'expense'}
                        onChange={(e) => setType(e.target.value)}
                        className="text-red-400 focus:ring-red-500 bg-gray-700 border-gray-600"
                      />
                      <span className="text-red-400 font-medium">Despesa</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={addTransaction}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Adicionar Transação
                </button>
              </div>
            )}

            {activeTab === 'list' && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">
                  Transações de {months[currentMonth]}
                </h2>

                {getCurrentMonthData().length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Nenhuma transação cadastrada</p>
                    <p>Adicione sua primeira transação na aba "Adicionar"</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getCurrentMonthData().map((transaction) => (
                      <div
                        key={transaction.id}
                        className={`border rounded-lg p-4 ${transaction.type === 'income'
                          ? 'border-green-700 bg-green-900/20'
                          : 'border-red-700 bg-red-900/20'
                          }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1">
                              {transaction.name}
                            </h3>
                            {transaction.description && (
                              <p className="text-gray-400 text-sm mb-2">
                                {transaction.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{transaction.date}</span>
                              <span className={`px-2 py-1 rounded text-xs ${transaction.type === 'income'
                                ? 'bg-green-800 text-green-300'
                                : 'bg-red-800 text-red-300'
                                }`}>
                                {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-lg font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                              }`}>
                              {transaction.type === 'income' ? '+' : '-'}R$ {transaction.value.toFixed(2).replace('.', ',')}
                            </span>
                            <button
                              onClick={() => deleteTransaction(transaction.id)}
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'charts' && (
              <div className="space-y-8">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <PieChart size={20} />
                  Análises Financeiras
                </h2>

                {/* Yearly Overview */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Visão Anual - {currentYear}</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getYearlyData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#F9FAFB'
                          }}
                          formatter={(value) => [`R$ ${value.toFixed(2)}`, '']}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="receitas"
                          stroke="#10b981"
                          strokeWidth={2}
                          name="Receitas"
                        />
                        <Line
                          type="monotone"
                          dataKey="despesas"
                          stroke="#ef4444"
                          strokeWidth={2}
                          name="Despesas"
                        />
                        <Line
                          type="monotone"
                          dataKey="economia"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          name="Economia"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pie Chart */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Distribuição - {months[currentMonth]}
                    </h3>
                    {getPieChartData().length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              dataKey="value"
                              data={getPieChartData()}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {getPieChartData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1F2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#F9FAFB'
                              }}
                              formatter={(value) => [`R$ ${value.toFixed(2)}`, '']}
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-gray-400">
                        <p>Nenhum dado para exibir</p>
                      </div>
                    )}
                  </div>

                  {/* Category Bar Chart */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Top Categorias - {months[currentMonth]}
                    </h3>
                    {getCategoryData().length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getCategoryData()} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis type="number" stroke="#9CA3AF" />
                            <YAxis
                              dataKey="categoria"
                              type="category"
                              stroke="#9CA3AF"
                              width={80}
                              fontSize={12}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1F2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#F9FAFB'
                              }}
                              formatter={(value) => [`R$ ${value.toFixed(2)}`, '']}
                            />
                            <Bar
                              dataKey="valor"
                              fill="#3b82f6"
                              radius={[0, 4, 4, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-gray-400">
                        <p>Nenhum dado para exibir</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Insights */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Insights Financeiros</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-purple-400 font-semibold mb-2">Meta de Economia</h4>
                      <p className="text-2xl font-bold text-white">{savingsRate}%</p>
                      <p className="text-sm text-gray-400">
                        {parseFloat(savingsRate) >= 20 ? 'Excelente! 🎉' :
                          parseFloat(savingsRate) >= 10 ? 'Bom progresso! 👍' :
                            'Tente economizar mais 💪'}
                      </p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-blue-400 font-semibold mb-2">Economia do Mês</h4>
                      <p className="text-2xl font-bold text-white">
                        R$ {Math.abs(balance).toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-sm text-gray-400">
                        {balance >= 0 ? 'Economia positiva' : 'Déficit no mês'}
                      </p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-green-400 font-semibold mb-2">Transações</h4>
                      <p className="text-2xl font-bold text-white">{getCurrentMonthData().length}</p>
                      <p className="text-sm text-gray-400">
                        Total no mês atual
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}