import { Navigate, useParams } from "react-router-dom";
import CrudPage from "../components/CrudPage";
import { moduleMap } from "../config/modules";

export default function ModulePage() {
  const { moduleKey } = useParams();
  const config = moduleMap.get(moduleKey ?? "");

  if (!config) {
    return <Navigate to="/Report" replace />;
  }

  return (
    <CrudPage
      title={config.title}
      description={config.description}
      endpoint={config.endpoint}
      fields={config.fields}
      tableFields={config.tableFields}
      searchFields={config.searchFields}
    />
  );
}