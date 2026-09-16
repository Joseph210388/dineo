import LegalDoc from "../../components/legal/legal-doc";
import { privacyDoc } from "../../lib/legal-docs";

export const metadata = {
  title: privacyDoc.metaTitle,
  description: privacyDoc.metaDescription,
};

export default function PrivacyPage() {
  return <LegalDoc doc={privacyDoc} />;
}
