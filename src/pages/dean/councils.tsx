import DeanLayout from "./layout";
import { CouncilsManagement } from "@/components/councils/councils-management";

function DeanCouncilsPageContent() {
  return <CouncilsManagement />;
}

export default function DeanCouncilsPage() {
  return (
    <DeanLayout>
      <DeanCouncilsPageContent />
    </DeanLayout>
  );
}
