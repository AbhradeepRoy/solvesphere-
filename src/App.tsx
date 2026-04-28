/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "./hooks/useUser";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import DoubtSolver from "./components/DoubtSolver";
import TutorChat from "./components/TutorChat";
import Profile from "./components/Profile";
import Settings from "./components/Settings";
import { LoadingScreen } from "./components/ui/LoadingScreen";
import { AuthScreen } from "./components/AuthScreen";

export default function App() {
  const { user, loading } = useUser();

  if (loading) return <LoadingScreen />;

  if (!user) return <AuthScreen />;

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/solve" element={<DoubtSolver />} />
          <Route path="/tutor" element={<TutorChat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

