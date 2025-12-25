import { DeanProjectsContent } from "../dean/projects";
import AdminLayout from "./layout";

export default function AdminProjectsPage() {
  return (
    <AdminLayout>
      <DeanProjectsContent readOnly={true} />
    </AdminLayout>
  );
}
