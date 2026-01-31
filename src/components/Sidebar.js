"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ReportIcon from "@mui/icons-material/Report";
import ChatIcon from "@mui/icons-material/Chat";
import PaymentIcon from "@mui/icons-material/Payment";
import ArticleIcon from "@mui/icons-material/Article";
import SettingsIcon from "@mui/icons-material/Settings";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

const drawerWidth = 280;

const menuItemsBeforeReports = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
  { text: "User Management", icon: <PeopleIcon />, path: "/users" },
  { text: "Match & Chat", icon: <ChatIcon />, path: "/matches" },
  { text: "Subscriptions", icon: <PaymentIcon />, path: "/subscription" },
  { text: "Purchases", icon: <PaymentIcon />, path: "/purchases" },
  { text: "Coupons", icon: <ArticleIcon />, path: "/coupons" },
];

const reportsSubItems = [
  { text: "Reported Users", path: "/reports" },
  { text: "Subscription Report", path: "/reports/subscription" },
  { text: "Finance Report", path: "/reports/finance" },
];

const itemSx = (selected) => ({
  borderRadius: 2,
  "&.Mui-selected": {
    background: "#3FA9C5",
    color: "white",
    "&:hover": {
      background: "#3FA9C5",
    },
  },
  "&:hover": {
    background: "rgba(63, 169, 197, 0.12)",
  },
});

export default function Sidebar({ open, onClose, variant = "permanent" }) {
  const router = useRouter();
  const pathname = usePathname();
  const reportsOpen = pathname.startsWith("/reports");
  const [reportsExpanded, setReportsExpanded] = useState(reportsOpen);

  const handleNavigation = (path) => {
    router.push(path);
    if (variant === "temporary") {
      onClose();
    }
  };

  const toggleReports = () => setReportsExpanded((prev) => !prev);

  const drawerContent = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, color: "#2E2E2E" }}>
          Admin Panel
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 2 }}>
        {menuItemsBeforeReports.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={pathname === item.path}
              sx={itemSx(pathname === item.path)}
            >
              <ListItemIcon sx={{ color: pathname === item.path ? "white" : "inherit", minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} sx={{ "& .MuiListItemText-primary": { fontWeight: pathname === item.path ? 600 : 400 } }} />
            </ListItemButton>
          </ListItem>
        ))}

        {/* Reports */}
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton onClick={toggleReports} sx={itemSx(reportsOpen)}>
            <ListItemIcon sx={{ color: reportsOpen ? "white" : "inherit", minWidth: 40 }}>
              <ReportIcon />
            </ListItemIcon>
            <ListItemText primary="Reports" sx={{ "& .MuiListItemText-primary": { fontWeight: reportsOpen ? 600 : 400 } }} />
            {reportsExpanded ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={reportsExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pl: 3 }}>
            {reportsSubItems.map((sub) => (
              <ListItem key={sub.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(sub.path)}
                  selected={pathname === sub.path}
                  sx={itemSx(pathname === sub.path)}
                >
                  <ListItemIcon sx={{ color: pathname === sub.path ? "white" : "inherit", minWidth: 36 }}>
                    {sub.path === "/reports" && <ReportIcon fontSize="small" />}
                    {sub.path === "/reports/subscription" && <SubscriptionsIcon fontSize="small" />}
                    {sub.path === "/reports/finance" && <AccountBalanceIcon fontSize="small" />}
                  </ListItemIcon>
                  <ListItemText primary={sub.text} sx={{ "& .MuiListItemText-primary": { fontWeight: pathname === sub.path ? 600 : 400, fontSize: "0.9rem" } }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>

        {/* Settings - single item */}
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            onClick={() => handleNavigation("/settings")}
            selected={pathname === "/settings"}
            sx={itemSx(pathname === "/settings")}
          >
            <ListItemIcon sx={{ color: pathname === "/settings" ? "white" : "inherit", minWidth: 40 }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" sx={{ "& .MuiListItemText-primary": { fontWeight: pathname === "/settings" ? 600 : 400 } }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          borderRight: "1px solid rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
