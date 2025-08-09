import { Paper, Typography, Box, Chip } from "@mui/material";
import { formatDistanceToNow } from "date-fns";

const eventTypeColors = {
  content_created: "primary",
  content_analyzed: "success",
  recommendation_generated: "info",
  user_interaction: "secondary",
  cache_update: "warning",
};

export default function StreamEvent({ event }) {
  return (
    <Paper sx={{ p: 2, mb: 1 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1,
        }}
      >
        <Chip
          label={event.type.replace("_", " ")}
          color={eventTypeColors[event.type] || "default"}
          size="small"
          sx={{ textTransform: "capitalize" }}
        />
        <Typography variant="caption" color="text.secondary">
          {event.timestamp
            ? formatDistanceToNow(new Date(parseInt(event.timestamp))) + " ago"
            : "Now"}
        </Typography>
      </Box>

      <Typography variant="body2" color="text.primary">
        {typeof event.data === "string"
          ? event.data
          : JSON.stringify(event.data)}
      </Typography>

      {event.source && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          Source: {event.source}
        </Typography>
      )}
    </Paper>
  );
}
