"use client";
import { Card, CardContent, Skeleton, Box } from "@mui/material";

export default function SkeletonCard() {
  return (
    <Card sx={{ bgcolor: "#fff", borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", minHeight: 140 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
          <Skeleton variant="rounded" width="60%" height={24} animation="pulse" />
          <Skeleton variant="circular" width={28} height={28} animation="pulse" />
        </Box>
        <Skeleton variant="rounded" width="45%" height={40} sx={{ mb: 1 }} animation="pulse" />
        <Skeleton variant="rounded" width="85%" height={20} animation="pulse" />
      </CardContent>
    </Card>
  );
}
