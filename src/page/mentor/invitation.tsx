import MentorLayout from "./layout";
import { ProjectInvitationsPageContent } from "@/features/project-management/components/project-invitations-page";

export default function MentorInvitations() {
  return (
    <MentorLayout>
      <ProjectInvitationsPageContent variant="mentor" />
    </MentorLayout>
  );
}
