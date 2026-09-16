import LegalDoc from "../../components/legal/legal-doc";
import { termsDoc } from "../../lib/legal-docs";

export const metadata = {
  title: termsDoc.metaTitle,
  description: termsDoc.metaDescription,
};

export default function TermsPage() {
  return <LegalDoc doc={termsDoc} />;
}
