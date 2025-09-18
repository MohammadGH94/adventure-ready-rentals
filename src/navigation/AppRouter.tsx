import { Platform } from "react-native";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { Route, Routes } from "react-router";

import Architecture from "../pages/Architecture";
import Browse from "../pages/Browse";
import HowItWorks from "../pages/HowItWorks";
import Index from "../pages/Index";
import InfoPage from "../pages/InfoPage";
import ListGear from "../pages/ListGear";
import NotFound from "../pages/NotFound";
import SignIn from "../pages/SignIn";

const AppRouter = () => {
  const RouterComponent = Platform.OS === "web" ? BrowserRouter : MemoryRouter;

  return (
    <RouterComponent>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/list-gear" element={<ListGear />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/architecture" element={<Architecture />} />
        <Route path="/info/:slug" element={<InfoPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </RouterComponent>
  );
};

export default AppRouter;
