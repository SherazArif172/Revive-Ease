import routeConfig from "./routes";
import { useSelector } from "react-redux";

const useSelectedRole = () => {
  const { adminRoutes, subAdminRoutes, providerRoutes, coachRoutes, clinicAdminRoutes } = routeConfig;
  const userType = useSelector((state) => state.user.userType);

  const selectedRoutes =
    userType === "admin"
      ? adminRoutes
      : userType === "sub admin"
        ? subAdminRoutes
        : userType === "coach"
          ? coachRoutes
          : userType === "provider"
            ? providerRoutes
            : clinicAdminRoutes;

  return selectedRoutes;
};

export default useSelectedRole;
