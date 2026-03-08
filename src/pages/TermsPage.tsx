import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/Breadcrumbs";
import SEOHead from "@/components/SEOHead";
import { useSiteSettings } from "@/hooks/useData";

const TermsPage = () => {
  const { data: settings } = useSiteSettings();
  const siteName = settings?.site_name || "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ";

  return (
    <Layout>
      <SEOHead title="শর্তাবলী | ইত্তেহাদ" description="ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ ওয়েবসাইট ব্যবহারের শর্তাবলী।" />
      <div className="max-w-[800px] mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: "শর্তাবলী" }]} />
        <h1 className="text-2xl font-bold text-foreground mb-6">শর্তাবলী (Terms & Conditions)</h1>
        <div className="prose prose-sm max-w-none text-foreground/80 space-y-5">
          <section>
            <h2 className="text-lg font-semibold text-foreground">১. সাধারণ শর্তাবলী</h2>
            <p>{siteName} ওয়েবসাইট ও মোবাইল অ্যাপ ব্যবহার করার মাধ্যমে আপনি এই শর্তাবলী মেনে চলতে সম্মত হচ্ছেন। এই শর্তাবলী যেকোনো সময় পরিবর্তন করা হতে পারে।</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">২. সেবা ব্যবহার</h2>
            <p>আমাদের সেবাসমূহ শুধুমাত্র বৈধ ও শিক্ষামূলক উদ্দেশ্যে ব্যবহার করা যাবে। কোনো অবৈধ বা ক্ষতিকর কার্যকলাপে এই প্ল্যাটফর্ম ব্যবহার করা সম্পূর্ণ নিষিদ্ধ।</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">৩. অ্যাকাউন্ট</h2>
            <p>আপনার অ্যাকাউন্টের নিরাপত্তা বজায় রাখা আপনার দায়িত্ব। আপনার অ্যাকাউন্ট থেকে সম্পাদিত সকল কার্যকলাপের জন্য আপনি দায়ী থাকবেন।</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">৪. বুকশপ ও অর্ডার</h2>
            <p>বুকশপ থেকে বই ক্রয়ের ক্ষেত্রে প্রদর্শিত মূল্য ও ডেলিভারি চার্জ প্রযোজ্য হবে। অর্ডার নিশ্চিত হওয়ার পর বাতিল করতে হলে আমাদের সাথে যোগাযোগ করতে হবে।</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">৫. কন্টেন্ট</h2>
            <p>ওয়েবসাইটে প্রকাশিত সকল কন্টেন্টের স্বত্ব {siteName}-এর। অনুমতি ব্যতীত কোনো কন্টেন্ট পুনঃপ্রকাশ বা বাণিজ্যিকভাবে ব্যবহার করা যাবে না।</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">৬. দায়সীমাবদ্ধতা</h2>
            <p>ওয়েবসাইট ব্যবহারজনিত কোনো প্রত্যক্ষ বা পরোক্ষ ক্ষতির জন্য {siteName} দায়ী থাকবে না।</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">৭. যোগাযোগ</h2>
            <p>শর্তাবলী সম্পর্কে কোনো প্রশ্ন থাকলে আমাদের যোগাযোগ পেজের মাধ্যমে জানাতে পারেন।</p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default TermsPage;
