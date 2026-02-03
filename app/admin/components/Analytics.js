"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Analytics() {
  const [revenueData, setRevenueData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [productPerformance, setProductPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month"); // month, year

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Get date range
      const now = new Date();
      const startDate = new Date();
      
      if (timeRange === "month") {
        startDate.setMonth(now.getMonth() - 1);
      } else {
        startDate.setFullYear(now.getFullYear() - 1);
      }

      // Fetch orders
      const ordersQuery = query(
        collection(db, "orders"),
        where("createdAt", ">=", startDate.toISOString()),
        orderBy("createdAt", "asc")
      );
      const ordersSnap = await getDocs(ordersQuery);
      
      const orders = ordersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Process revenue data with more granular grouping
      const revenueMap = {};
      orders.forEach((order) => {
        const date = new Date(order.createdAt);
        // For month view: group by day, for year view: group by week
        let key;
        if (timeRange === "month") {
          key = `${date.getDate()}/${date.getMonth() + 1}`;
        } else {
          // Group by week for year view
          const weekNumber = Math.ceil(date.getDate() / 7);
          key = `Week ${weekNumber} - ${date.getMonth() + 1}/${date.getFullYear()}`;
        }
        
        if (!revenueMap[key]) {
          revenueMap[key] = { date: key, revenue: 0, orders: 0 };
        }
        revenueMap[key].revenue += order.totalAmount || order.total || order.amount || 0;
        revenueMap[key].orders += 1;
      });

      const revenueChartData = Object.values(revenueMap).sort((a, b) => {
        if (timeRange === "month") {
          const [aDay, aMonth] = a.date.split("/").map(Number);
          const [bDay, bMonth] = b.date.split("/").map(Number);
          return aMonth - bMonth || aDay - bDay;
        } else {
          // Sort by date for year view
          return new Date(a.date.split(" - ")[1] || a.date) - new Date(b.date.split(" - ")[1] || b.date);
        }
      });

      setRevenueData(revenueChartData);
      setOrdersData(revenueChartData);

      // Fetch users for growth chart
      const usersQuery = query(
        collection(db, "users"),
        orderBy("createdAt", "asc")
      );
      const usersSnap = await getDocs(usersQuery);
      
      const users = usersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Process user growth with same granularity
      const userGrowthMap = {};
      users.forEach((user) => {
        if (!user.createdAt) return;
        const date = new Date(user.createdAt);
        let key;
        if (timeRange === "month") {
          key = `${date.getDate()}/${date.getMonth() + 1}`;
        } else {
          const weekNumber = Math.ceil(date.getDate() / 7);
          key = `Week ${weekNumber} - ${date.getMonth() + 1}/${date.getFullYear()}`;
        }
        
        if (!userGrowthMap[key]) {
          userGrowthMap[key] = { date: key, users: 0 };
        }
        userGrowthMap[key].users += 1;
      });

      const userGrowthChartData = Object.entries(userGrowthMap)
        .map(([date, data]) => ({ ...data }))
        .sort((a, b) => {
          if (timeRange === "month") {
            const [aDay, aMonth] = a.date.split("/").map(Number);
            const [bDay, bMonth] = b.date.split("/").map(Number);
            return aMonth - bMonth || aDay - bDay;
          } else {
            return new Date(a.date.split(" - ")[1] || a.date) - new Date(b.date.split(" - ")[1] || b.date);
          }
        });

      // Calculate cumulative users
      let cumulative = 0;
      const cumulativeData = userGrowthChartData.map((item) => {
        cumulative += item.users;
        return { ...item, users: cumulative };
      });

      setUserGrowthData(cumulativeData);

      // Fetch products for performance
      const productsSnap = await getDocs(collection(db, "products"));
      const products = productsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Get product views from recentViews
      const viewsSnap = await getDocs(collection(db, "recentViews"));
      const views = viewsSnap.docs.map((doc) => doc.data());
      
      const productViews = {};
      views.forEach((view) => {
        if (view.productId) {
          productViews[view.productId] = (productViews[view.productId] || 0) + 1;
        }
      });

      // Top 10 products by views
      const topProducts = products
        .map((product) => ({
          name: product.name || "Unnamed",
          views: productViews[product.id] || 0,
          price: product.price || 0,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      setProductPerformance(topProducts);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Determine chart type based on data density
  const getChartType = (data) => {
    if (!data || data.length === 0) return 'linear';
    // If we have few data points (less than 5), use linear for cleaner look
    // Otherwise use natural for smoother curves
    return data.length < 5 ? 'linear' : 'natural';
  };

  const revenueChartType = getChartType(revenueData);
  const userChartType = getChartType(userGrowthData);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange("month")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timeRange === "month"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Last Month
          </button>
          <button
            onClick={() => setTimeRange("year")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timeRange === "year"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Last Year
          </button>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Revenue Trend
          {revenueData.length > 0 && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({revenueData.length} {revenueData.length === 1 ? 'data point' : 'data points'})
            </span>
          )}
        </h3>
        {revenueData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <p>No revenue data available for the selected period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af" 
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis 
              stroke="#9ca3af" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              tickFormatter={(value) => `UGX ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#fff", 
                border: "1px solid #e5e7eb", 
                borderRadius: "8px",
                padding: "8px 12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}
              formatter={(value) => [`UGX ${value.toLocaleString()}`, "Revenue"]}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Area
              type={revenueChartType}
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              dot={revenueData.length <= 10 ? { r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" } : { r: 3, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>

      {/* Orders Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Orders per Day</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ordersData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af" 
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis 
              stroke="#9ca3af" 
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#fff", 
                border: "1px solid #e5e7eb", 
                borderRadius: "8px",
                padding: "8px 12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Bar dataKey="orders" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* User Growth Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          User Growth
          {userGrowthData.length > 0 && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({userGrowthData.length} {userGrowthData.length === 1 ? 'data point' : 'data points'})
            </span>
          )}
        </h3>
        {userGrowthData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <p>No user growth data available for the selected period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af" 
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis 
              stroke="#9ca3af" 
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#fff", 
                border: "1px solid #e5e7eb", 
                borderRadius: "8px",
                padding: "8px 12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Line
              type={userChartType}
              dataKey="users"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              dot={userGrowthData.length <= 10 ? { r: 4, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" } : { r: 3, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" }}
            />
          </LineChart>
        </ResponsiveContainer>
        )}
      </div>

      {/* Product Performance */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Products by Views</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={productPerformance} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
            <XAxis 
              type="number" 
              stroke="#9ca3af" 
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              stroke="#9ca3af" 
              width={150}
              tick={{ fontSize: 11 }}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#fff", 
                border: "1px solid #e5e7eb", 
                borderRadius: "8px",
                padding: "8px 12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4 }}
            />
            <Bar dataKey="views" fill="#f59e0b" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
