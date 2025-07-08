const MainContent = () => {
  return (
    <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          Welcome to ZubiPOS
        </h2>
        <p className="text-gray-600 text-lg">
          Complete point of sale management system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center gap-4">
          <div className="w-15 h-15 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
            💰
          </div>
          <div className="flex-1">
            <h3 className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
              Today's Sales
            </h3>
            <p className="text-2xl font-bold text-slate-800 mb-1">$2,450</p>
            <span className="text-sm font-medium text-green-600">+12.5%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center gap-4">
          <div className="w-15 h-15 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
            📊
          </div>
          <div className="flex-1">
            <h3 className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
              Transactions
            </h3>
            <p className="text-2xl font-bold text-slate-800 mb-1">284</p>
            <span className="text-sm font-medium text-green-600">+5.2%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center gap-4">
          <div className="w-15 h-15 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
            👥
          </div>
          <div className="flex-1">
            <h3 className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
              Customers
            </h3>
            <p className="text-2xl font-bold text-slate-800 mb-1">892</p>
            <span className="text-sm font-medium text-red-600">-2.1%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center gap-4">
          <div className="w-15 h-15 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
            📦
          </div>
          <div className="flex-1">
            <h3 className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
              Items In Stock
            </h3>
            <p className="text-2xl font-bold text-slate-800 mb-1">1,256</p>
            <span className="text-sm font-medium text-green-600">+8.3%</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
            <span className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
              🛒
            </span>
            <div className="flex-1">
              <p className="font-medium text-slate-800 mb-1">
                New order #1234 received
              </p>
              <span className="text-sm text-gray-500">2 minutes ago</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
            <span className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
              👤
            </span>
            <div className="flex-1">
              <p className="font-medium text-slate-800 mb-1">
                New customer registered
              </p>
              <span className="text-sm text-gray-500">15 minutes ago</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
            <span className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
              📦
            </span>
            <div className="flex-1">
              <p className="font-medium text-slate-800 mb-1">
                Product inventory updated
              </p>
              <span className="text-sm text-gray-500">1 hour ago</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MainContent;
