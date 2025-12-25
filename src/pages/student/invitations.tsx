import StudentLayout from "./layout";
import { ProjectInvitationsPageContent } from "@/components/projects/project-invitations-page";

export default function StudentInvitations() {
  return (
    <StudentLayout>
      <ProjectInvitationsPageContent variant="student" />
    </StudentLayout>
  );
}
