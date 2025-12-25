import AdminLayout from "./layout";
import { CouncilsManagement } from "@/components/councils/councils-management";

function AdminCouncilsPageContent() {
  return <CouncilsManagement />;
}

export default function AdminCouncilsPage() {
  return (
    <AdminLayout>
      <AdminCouncilsPageContent />
    </AdminLayout>
  );
}
