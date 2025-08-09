import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
} from "@mui/material";
import { TrendingUp } from "@mui/icons-material";

type MetricCardProps = {
  title: string;
  value: number | string;
  subtitle: string;
  loading: boolean;
  trend?: number;
};

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  loading = false,
}: MetricCardProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        {loading ? (
          <LinearProgress />
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 2,
              }}
            >
              <Typography variant="h4" component="div" fontWeight="bold">
                {typeof value === "number" ? value.toLocaleString() : value}
              </Typography>
              {trend && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "success.main",
                  }}
                >
                  <TrendingUp fontSize="small" />
                  <Typography variant="body2" sx={{ ml: 0.5 }}>
                    +{trend}%
                  </Typography>
                </Box>
              )}
            </Box>
            <Typography variant="h6" color="text.primary" gutterBottom>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
