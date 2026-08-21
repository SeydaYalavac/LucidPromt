export type LegalNoticeSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LegalNotice = {
  title: string;
  description: string;
  counterpart: { label: string; href: string };
  currentPractice: string;
  atAGlance: string[];
  sections: LegalNoticeSection[];
};

export const noticeDate = "August 21, 2026";
export const supportAddress = "whatshappeninginai@mail.tin.computer";

export const privacyNotice: LegalNotice = {
  title: "Privacy notice",
  description:
    "What the current product handles, why it is used, and where you can make a request about your information.",
  counterpart: { label: "Read the terms", href: "/terms" },
  currentPractice:
    "This notice describes current product behavior. Public browsing and limited product analytics are active. Account controls are visible but disabled until the production Supabase connection is complete, so the disabled signup form does not submit account data today.",
  atAGlance: [
    "Analytics and masked replay exclude form values, email, display name, chat bodies, query strings, URL hashes, and readable page text.",
    "Account and chat data will be handled only when the production account service is connected.",
    "There is no self-serve account deletion control today. Requests go to support.",
  ],
  sections: [
    {
      id: "information",
      title: "Information the product handles",
      paragraphs: [
        "The product handles different information depending on whether you browse public pages, create an account when account access is available, join a discussion, save a trend, or contact support.",
      ],
      bullets: [
        "Public browsing and product analytics: the route you visit, the page URL limited to its origin and path, signup button source, authentication method and outcome, product value and error states, rage-click signals, and one bounded tracking-interest category if you choose to answer the in-product question.",
        "Account information when enabled: email address, password authentication material, display name, OAuth provider identity, account identifier, and session information handled through Supabase.",
        "Public discussion when enabled: message body, account identifier, display name, trend, timestamp, moderation provider and labels, and whether the message is visible or removed.",
        "Public source records: source name, public source or community label, title, bounded excerpt, source URL, engagement and audience counts where available, timestamps, and available country metadata from official or permissioned feeds.",
        "Support: the sender address, message, and any information you choose to include when you email the support mailbox.",
      ],
    },
    {
      id: "analytics",
      title: "Privacy-scoped analytics",
      paragraphs: [
        "The current site uses PostHog to understand whether visitors reach important product steps. Privacy-masked session replay and rage-click detection are enabled. Broad click autocapture, automatic page-leave capture, and exception capture are discarded or disabled.",
        "Recordings mask all readable page text, all inputs, and element attributes, and do not capture request or response bodies. Analytics removes query strings and URL hashes from automatic URL fields. It does not send form values, passwords, email addresses, display names, chat message bodies, or written survey responses. If account access is enabled and you sign in, the analytics session is identified by the Supabase user ID rather than by email or display name.",
      ],
    },
    {
      id: "use",
      title: "How information is used",
      paragraphs: [
        "The current product uses this information to serve public pages, operate authentication and recovery when connected, maintain sessions, show an author name beside public discussion, moderate and deliver chat, generate source-linked trend explanations, diagnose failed product steps, and understand whether the product journey works.",
        "Saved trend slugs are stored in your browser so the saved view can work without an account. The product does not currently include advertising or a mechanism for selling account or analytics data.",
      ],
    },
    {
      id: "providers",
      title: "Services that receive information",
      paragraphs: [
        "The product relies on the following services for the functions described here. A provider receives information only when the relevant function is used or configured.",
      ],
      bullets: [
        "Vercel serves the site and handles normal web requests needed to deliver it.",
        "Supabase handles account authentication, sessions, and the application database when the production connection is enabled.",
        "Google, GitHub, or Apple participates in the authentication exchange only when you choose that OAuth provider; the product receives the identity and profile information returned through Supabase.",
        "PostHog receives the limited product analytics events described above.",
        "OpenAI receives a chat message body when OpenAI moderation is configured; otherwise moderation uses a local blocklist. OpenAI also receives source and trend context when the Why Layer explanation service is configured.",
        "Tin Computer's managed mailbox receives the contents of support email you choose to send.",
      ],
    },
    {
      id: "public-and-local",
      title: "Public discussion and browser storage",
      paragraphs: [
        "Visible chat messages and their display names are readable by anyone. Do not post private or confidential information in a trend discussion.",
        "Saved trend slugs stay in local browser storage. You can remove an individual save in the product or clear the site's browser storage. Native sharing uses your browser or device share sheet; the clipboard fallback copies the public URL on your device.",
      ],
    },
    {
      id: "choices",
      title: "Your choices and deletion requests",
      paragraphs: [
        `You can browse the public product without creating an account. You can choose whether to use Google, GitHub, Apple, or email authentication when account access becomes available. You can also choose not to post in public discussion or contact support.`,
        `There is no self-serve account deletion control in the current product. To request access, correction, or deletion of account-associated information, email ${supportAddress}. Include enough information to locate the account, but do not send a password or OAuth token.`,
      ],
    },
    {
      id: "changes",
      title: "Changes and contact",
      paragraphs: [
        `This page will be updated when current product practice changes. Questions and information requests can be sent to ${supportAddress}.`,
      ],
    },
  ],
};

export const termsNotice: LegalNotice = {
  title: "Terms of use",
  description:
    "The current rules for using the public signal product, account features, and source-linked discussion.",
  counterpart: { label: "Read the privacy notice", href: "/privacy" },
  currentPractice:
    "These terms describe the product as it works today. Public browsing is available for $0. Account creation, live records, and discussion may be unavailable while the production data and authentication services are being connected.",
  atAGlance: [
    "Scores and AI explanations are informational. Check the linked source evidence.",
    "Public discussion must not contain private, unlawful, abusive, or spam content.",
    "There is no paid plan, checkout, trial clock, or published usage cap today.",
  ],
  sections: [
    {
      id: "service",
      title: "The current service",
      paragraphs: [
        "What's Happening groups observations from official or permissioned sources into scored technology trends. It can show source links, bounded excerpts, country context, a Why Layer explanation, and trend-specific discussion when the required production services are available.",
        "A score, breakout label, country tag, or AI-generated explanation is an aid for inspecting attention, not a verified fact, prediction, recommendation, or statement of who originated a topic. Check the linked source evidence before relying on a record.",
      ],
    },
    {
      id: "accounts",
      title: "Accounts and access",
      paragraphs: [
        "Public pages can be browsed without an account. When account access is enabled, email/password and Google, GitHub, and Apple authentication are intended to provide identity for discussion and account features.",
        "Keep your authentication method secure, provide information you are entitled to use, and do not attempt to access another person's account. If you use an OAuth provider, that provider's own terms also apply to its service.",
      ],
    },
    {
      id: "discussion",
      title: "Public discussion",
      paragraphs: [
        "Visible trend messages and display names are public. Do not post passwords, tokens, private personal information, confidential material, or anything you do not have the right to share.",
        "The discussion endpoint limits message length and posting rate. Messages can be rejected or marked removed through the product's moderation controls.",
      ],
    },
    {
      id: "use",
      title: "Acceptable use",
      paragraphs: [
        "Use the product in a way that does not interfere with its operation or other visitors. Do not bypass access controls, probe for unauthorized access, overload the service, automate abusive traffic, impersonate another person, distribute malware or spam, or use the product for unlawful activity.",
      ],
    },
    {
      id: "sources",
      title: "Sources and third-party services",
      paragraphs: [
        "Source links lead to services outside this product. Their availability, content, and rules are controlled by their providers. A source link or public author label is evidence attached to a signal, not an endorsement.",
        "Authentication, hosting, analytics, moderation, and support functions rely on the third-party services listed in the privacy notice. Your use of those services may also be governed by their own terms.",
      ],
    },
    {
      id: "availability",
      title: "Availability and price",
      paragraphs: [
        "The product is in early access and is provided as available. Data sources, live records, authentication, explanations, and discussion can be delayed, incomplete, changed, paused, or unavailable. The product does not promise uninterrupted access or that a trend score or explanation is accurate.",
        "Public access and intended early account access are currently $0. There is no paid plan, checkout, trial clock, billing path, published usage cap, or future paid price in the current product.",
      ],
    },
    {
      id: "requests",
      title: "Account requests, changes, and contact",
      paragraphs: [
        `There is no self-serve account deletion control in the current product. Account-associated access, correction, and deletion requests can be sent to ${supportAddress}.`,
        `These terms may change as the product changes. The date at the top identifies the current version. Questions about these terms can be sent to ${supportAddress}.`,
      ],
    },
  ],
};
