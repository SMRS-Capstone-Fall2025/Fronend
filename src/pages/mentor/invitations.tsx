import MentorLayout from "./layout";
import { ProjectInvitationsPageContent } from "@/components/projects/project-invitations-page";

export default function MentorInvitations() {
  return (
    <MentorLayout>
      <ProjectInvitationsPageContent variant="mentor" />
    </MentorLayout>
  );
}
