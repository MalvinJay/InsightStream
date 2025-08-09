import { Grid, Typography, Paper, Box, Alert } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import MetricCard from "../components/MetricCard";
import { useAnalytics } from "../hooks/useApi";
import { useWebSocket } from "../hooks/useWebSocket";
import { useEffect, useState } from "react";
import { EventProp } from "@/common.types";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function Dashboard() {
  const { metrics, loading, error } = useAnalytics();
  const { isConnected, events } = useWebSocket();
  const [liveMetrics, setLiveMetrics] = useState({
    totalContent: 0,
    activeUsers: 0,
    processingQueue: 0,
    cacheHitRate: 0,
  });

  // Mock real-time data for demonstration
  useEffect(() => {
    if (metrics.content) {
      setLiveMetrics({
        totalContent: metrics.content.total || 0,
        activeUsers: Math.floor(Math.random() * 1000) + 500,
        processingQueue: Math.floor(Math.random() * 20),
        cacheHitRate: 94.2 + (Math.random() - 0.5) * 10,
      });
    }
  }, [metrics]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics((prev) => ({
        totalContent: prev.totalContent + Math.floor(Math.random() * 3),
        activeUsers: Math.max(
          0,
          prev.activeUsers + Math.floor(Math.random() * 20) - 10
        ),
        processingQueue: Math.max(
          0,
          prev.processingQueue + Math.floor(Math.random() * 6) - 3
        ),
        cacheHitRate: Math.min(
          100,
          Math.max(80, prev.cacheHitRate + (Math.random() - 0.5) * 5)
        ),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load dashboard data. Please check if the backend is running.
      </Alert>
    );
  }

  // Mock chart data
  const engagementData = [
    { name: "00:00", views: 4000, reactions: 2400 },
    { name: "04:00", views: 3000, reactions: 1398 },
    { name: "08:00", views: 2000, reactions: 9800 },
    { name: "12:00", views: 2780, reactions: 3908 },
    { name: "16:00", views: 1890, reactions: 4800 },
    { name: "20:00", views: 2390, reactions: 3800 },
    { name: "24:00", views: 3490, reactions: 4300 },
  ];

  const sentimentData =
    metrics.content?.sentiment_distribution?.map(
      (item: { _id: string; count: string }) => ({
        name: item._id,
        value: item.count,
      })
    ) || [];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      {!isConnected && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          WebSocket disconnected. Real-time updates may not work.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Metrics */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Content"
            value={liveMetrics.totalContent}
            subtitle="Articles & Comments"
            trend={12}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Users"
            value={liveMetrics.activeUsers}
            subtitle="Currently Online"
            trend={8}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Processing Queue"
            value={liveMetrics.processingQueue}
            subtitle="Items Waiting"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Cache Hit Rate"
            value={`${liveMetrics.cacheHitRate.toFixed(1)}%`}
            subtitle="Redis Performance"
            trend={3}
            loading={loading}
          />
        </Grid>

        {/* Engagement Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Real-time Engagement
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="reactions"
                  stroke="#82ca9d"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Sentiment Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sentiment Distribution
            </Typography>
            {sentimentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sentimentData.map((entry: string, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 300,
                }}
              >
                <Typography color="text.secondary">
                  No sentiment data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Events */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Live Events ({events.length})
            </Typography>
            <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
              {events.slice(0, 10).map((event: EventProp, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 1,
                    borderBottom: "1px solid #eee",
                    "&:last-child": { borderBottom: "none" },
                  }}
                >
                  <Typography variant="body2">
                    <strong>{event.type}:</strong>{" "}
                    {JSON.stringify(
                      event.data || event.message || "Event received"
                    )}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date().toLocaleTimeString()}
                  </Typography>
                </Box>
              ))}
              {events.length === 0 && (
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 2 }}
                >
                  Waiting for live events...
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
