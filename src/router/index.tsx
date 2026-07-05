import { createBrowserRouter, Navigate } from "react-router-dom";
import { GuestRoute, ProtectedRoute } from "@/components/auth";
import {
  AdminLayout,
  AuthLayout,
  LandingLayout,
  ParentLayout,
  RootLayout,
} from "@/layouts";
import { LoginPage, RegisterPage } from "@/pages/auth";
import { LandingPage } from "@/pages/LandingPage";
import {
  AdminDashboardPage,
  FamiliesChildrenPage,
  HospitalCatalogsPage,
  ScheduleRulesPage,
} from "@/pages/admin";
import {
  DashboardPage,
  HospitalMapsPage,
  RemindersPage,
  TimelinePage,
} from "@/pages/parent";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <LandingLayout />,
        children: [{ index: true, element: <LandingPage /> }],
      },
      {
        path: "auth",
        element: <AuthLayout />,
        children: [
          {
            path: "parent/login",
            element: (
              <GuestRoute role="parent">
                <LoginPage role="parent" />
              </GuestRoute>
            ),
          },
          {
            path: "parent/register",
            element: (
              <GuestRoute role="parent">
                <RegisterPage role="parent" />
              </GuestRoute>
            ),
          },
          {
            path: "admin/login",
            element: (
              <GuestRoute role="admin">
                <LoginPage role="admin" />
              </GuestRoute>
            ),
          },
          {
            path: "admin/register",
            element: (
              <GuestRoute role="admin">
                <RegisterPage role="admin" />
              </GuestRoute>
            ),
          },
        ],
      },
      {
        path: "parent",
        element: (
          <ProtectedRoute role="parent">
            <ParentLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "timeline", element: <TimelinePage /> },
          { path: "hospitals", element: <HospitalMapsPage /> },
          { path: "reminders", element: <RemindersPage /> },
        ],
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <AdminDashboardPage /> },
          { path: "families", element: <FamiliesChildrenPage /> },
          { path: "hospitals", element: <HospitalCatalogsPage /> },
          { path: "schedules", element: <ScheduleRulesPage /> },
        ],
      },
    ],
  },
]);
