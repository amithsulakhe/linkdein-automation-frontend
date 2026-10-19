import { Link } from 'react-router-dom';
import PublicShell from '@/components/public-shell';

export default function PrivacyPage() {
  return (
    <PublicShell title="Privacy Policy">
      <p>Last updated 19 October 2026</p>
      <p>
        This policy explains how LinkedIn AI Agent handles information when you use the service. The app is not
        affiliated with LinkedIn or Google. Questions: <a href="mailto:amithsulakhe123@gmail.com">amithsulakhe123@gmail.com</a>.
      </p>
      <h2>Information you give us</h2>
      <ul>
        <li>Account details: display name, email address, and a password stored as a hash.</li>
        <li>Content you create: post text, images, schedule, approval decisions, and chatbot messages.</li>
        <li>Documents you upload for the knowledge base, and text extracted from those documents.</li>
        <li>Settings, including notification preferences and the times you want drafts created.</li>
      </ul>
      <h2>Google user data</h2>
      <p>Connecting Gmail is optional. If you connect it, the app requests these permissions:</p>
      <ul>
        <li>
          <strong>Send email</strong> (gmail.send). Used only to send messages you asked the app to send, such as a
          draft-approval email and a notice after a post is published. The app does not read, search, delete, or change
          mail in your mailbox.
        </li>
        <li>
          <strong>Email address and OpenID</strong>. Used to identify which Google account you connected and to show
          that address in Settings.
        </li>
      </ul>
      <p>
        The app stores the Google access token and refresh token in encrypted form, together with the connected email
        address, granted permissions, and token expiry. It uses those tokens only to send the emails described above.
      </p>
      <p>
        LinkedIn AI Agent&apos;s use and transfer to any other app of information received from Google APIs will adhere
        to the{' '}
        <a href="https://developers.google.com/terms/api-services-user-data-policy">
          Google API Services User Data Policy
        </a>
        , including the Limited Use requirements.
      </p>
      <p>
        Google user data is not sold. It is not used for advertising, credit, or lending decisions. It is not used to
        train general-purpose AI models. It is not sent to OpenAI or other AI providers. People do not read your Google
        data unless you ask for support about a specific problem, or we must do so to secure the service, comply with
        law, or investigate abuse.
      </p>
      <h2>LinkedIn data</h2>
      <p>
        If you connect LinkedIn, the app stores an encrypted access token and the account identifier LinkedIn provides.
        It uses that connection to publish a post only after you approve it, and to read analytics for posts the app
        published.
      </p>
      <h2>How other information is used</h2>
      <ul>
        <li>To run your account, show your posts, and send the notifications you enabled.</li>
        <li>
          To draft post text and answer chatbot questions. The text of your posts and uploaded documents may be sent to
          OpenAI for that purpose. Google user data is not included in those requests.
        </li>
        <li>To keep the service reliable and to investigate misuse.</li>
      </ul>
      <h2>Sharing</h2>
      <p>
        We share information with service providers only as needed to run the app: hosting, the database, email
        delivery through the Gmail API, LinkedIn when you approve a post, and OpenAI for drafting and chat. We do not
        sell personal information. We may disclose information if the law requires it.
      </p>
      <h2>Retention and deletion</h2>
      <p>
        Account data and content stay until you delete them. In Settings, Start fresh deletes posts, approvals,
        analytics, documents, chat history, and scheduled jobs, and removes stored LinkedIn and Gmail tokens. You can
        also revoke the app&apos;s Google access at any time from{' '}
        <a href="https://myaccount.google.com/permissions">your Google Account permissions</a>.
      </p>
      <h2>Security</h2>
      <p>Passwords are hashed. OAuth tokens are encrypted before they are stored.</p>
      <h2>Contact</h2>
      <p>
        Email <a href="mailto:amithsulakhe123@gmail.com">amithsulakhe123@gmail.com</a> to ask about this policy or to
        request deletion of your account data. The <Link to="/terms">Terms of Service</Link> explain the rules for
        using the app.
      </p>
    </PublicShell>
  );
}
