import { Link } from 'react-router-dom';
import PublicShell from '@/components/public-shell';
import { buttonVariants } from '@/components/ui/button';

export default function PublicHomePage() {
  return (
    <PublicShell title="LinkedIn AI Agent">
      <p>Draft LinkedIn posts with AI, then publish only after you approve them.</p>
      <p>
        LinkedIn AI Agent is an independent content studio. You connect your own LinkedIn account and, if you want
        email approvals, your own Gmail account. Nothing is published to LinkedIn until you approve it.
      </p>
      <h2>What you can do</h2>
      <ul>
        <li>Write and schedule LinkedIn posts, with optional images.</li>
        <li>Let the app draft posts on a schedule you choose.</li>
        <li>Approve or reject a draft from the app or from an email sent through your Gmail account.</li>
        <li>Ask a chatbot questions about documents you upload.</li>
      </ul>
      <h2>Google account access</h2>
      <p>
        If you connect Gmail, the app asks for permission to see your Google account email address and to send email
        as you. It uses that only to send approval requests and publish notifications you turned on. It does not read
        your inbox. Details are in the <Link to="/privacy">Privacy Policy</Link>.
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link to="/login" className={buttonVariants()}>
          Sign in
        </Link>
        <Link to="/register" className={buttonVariants({ variant: 'outline' })}>
          Create account
        </Link>
        <Link to="/privacy" className={buttonVariants({ variant: 'outline' })}>
          Privacy Policy
        </Link>
        <Link to="/terms" className={buttonVariants({ variant: 'outline' })}>
          Terms of Service
        </Link>
      </div>
    </PublicShell>
  );
}
