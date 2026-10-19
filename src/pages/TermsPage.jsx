import { Link } from 'react-router-dom';
import PublicShell from '@/components/public-shell';

export default function TermsPage() {
  return (
    <PublicShell title="Terms of Service">
      <p>Last updated 19 October 2026</p>
      <p>
        These terms cover your use of LinkedIn AI Agent. By creating an account or connecting LinkedIn or Gmail, you
        agree to them. The app is an independent service and is not affiliated with LinkedIn or Google.
      </p>
      <h2>The service</h2>
      <p>
        The app helps you draft, review, approve, and publish content to LinkedIn, and can email you about those drafts
        through Gmail if you connect it. Features can change. A draft or scheduled post can fail if LinkedIn, Gmail, or
        the network is unavailable.
      </p>
      <h2>Your account</h2>
      <p>
        You must provide a working email address and keep your password private. You are responsible for activity under
        your account. You must own or have permission to use the LinkedIn and Google accounts you connect.
      </p>
      <h2>Approval and publishing</h2>
      <p>
        The app does not publish a post to LinkedIn until you approve it in the app or through the approval link sent
        to you. You are responsible for reviewing drafts before you approve them, including text produced by AI. You
        must follow LinkedIn&apos;s terms and professional community policies.
      </p>
      <h2>Acceptable use</h2>
      <p>
        Do not use the app to break the law, send spam, impersonate someone else, upload files you do not have the
        right to use, or attempt to access another person&apos;s account or the service&apos;s systems without
        permission.
      </p>
      <h2>Google and LinkedIn</h2>
      <p>
        Connecting Gmail lets the app send email as you for approval and notification messages you enabled. You can
        revoke that access from your Google Account. Connecting LinkedIn lets the app publish approved posts and read
        analytics for those posts. See the <Link to="/privacy">Privacy Policy</Link> for how that data is handled.
      </p>
      <h2>Your content</h2>
      <p>
        You keep your rights to the posts and documents you submit. You give the app permission to host, process, and,
        after you approve, publish that content so the service can operate. AI output can be inaccurate. Check it
        before you publish.
      </p>
      <h2>Ending use</h2>
      <p>
        You may stop using the app at any time and may ask us to delete your account data at{' '}
        <a href="mailto:amithsulakhe123@gmail.com">amithsulakhe123@gmail.com</a>. We may suspend access if these terms
        are broken or if continued access would put the service or other people at risk.
      </p>
      <h2>Liability</h2>
      <p>
        The service is provided as is. To the extent the law allows, we are not liable for lost posts, lost profits, or
        indirect damages arising from your use of the app.
      </p>
      <h2>Contact</h2>
      <p>
        Email <a href="mailto:amithsulakhe123@gmail.com">amithsulakhe123@gmail.com</a> about these terms.
      </p>
    </PublicShell>
  );
}
