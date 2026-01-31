"use client";
import { Card, Skeleton, Box } from "@mui/material";

export default function ChartSkeleton({ height = 280 }) {
  return (
    <Card sx={{ p: 2, borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", height: height + 48 }}>
      <Skeleton variant="rounded" width="50%" height={28} sx={{ mb: 2 }} animation="pulse" />
      <Box
        sx={{
          height,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 0.5,
          px: 0.5,
        }}
      >
        {[65, 40, 80, 55, 70, 45, 90, 50, 60, 75].map((h, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            animation="pulse"
            sx={{
              flex: 1,
              height: `${h}%`,
              minHeight: 24,
              borderRadius: "4px 4px 0 0",
            }}
          />
        ))}
      </Box>
    </Card>
  );
}
