import { useState } from "react";
import {
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Alert,
} from "@mui/material";
import StreamEvent from "../components/StreamEvent";
import { useStreams } from "../hooks/useApi";
import { useWebSocket } from "../hooks/useWebSocket";
import { EventProp } from "@/common.types";

const streamOptions = [
  { value: "content_stream", label: "Content Stream" },
  { value: "ai_stream", label: "AI Processing Stream" },
  { value: "user_stream", label: "User Interaction Stream" },
  { value: "system_stream", label: "System Events Stream" },
];

export default function Streams() {
  const [selectedStream, setSelectedStream] = useState("content_stream");
  const { events, streamInfo, loading, error } = useStreams(selectedStream);
  const { isConnected, events: liveEvents } = useWebSocket();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Live Event Streams
      </Typography>

      {!isConnected && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          WebSocket disconnected. Live updates may not work.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Stream Selection
            </Typography>
            <TextField
              select
              label="Select Stream"
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            >
              {streamOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            {streamInfo && Object.keys(streamInfo).length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Stream Info
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Length: {streamInfo.length || 0} events
                </Typography>
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Live WebSocket Events ({liveEvents.length})
            </Typography>
            <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
              {liveEvents.slice(0, 5).map((event, index) => (
                <StreamEvent key={index} event={event} />
              ))}
              {liveEvents.length === 0 && (
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 2 }}
                >
                  No live events yet...
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {streamOptions.find((s) => s.value === selectedStream)?.label}{" "}
              Events
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Failed to load stream events. Please check if the backend is
                running.
              </Alert>
            )}

            {loading ? (
              <Typography>Loading events...</Typography>
            ) : (
              <Box sx={{ maxHeight: 600, overflowY: "auto" }}>
                {events.map((event: EventProp, index: number) => (
                  <StreamEvent key={event.id || index} event={event} />
                ))}
                {events.length === 0 && (
                  <Typography
                    color="text.secondary"
                    sx={{ textAlign: "center", py: 4 }}
                  >
                    No events in this stream yet.
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
