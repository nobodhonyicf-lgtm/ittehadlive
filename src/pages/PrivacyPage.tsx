import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/Breadcrumbs";
import SEOHead from "@/components/SEOHead";
import { useSiteSettings } from "@/hooks/useData";

const PrivacyPage = () => {
  const { data: settings } = useSiteSettings();
  const siteName = settings?.site_name || "ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ";

  return (
    <Layout>
      <SEOHead title="গোপনীয়তা নীতি | ইত্তেহাদ" description="ইত্তেহাদুল মাদারিসিল খুসুসিয়্যাহ-এর গোপনীয়তা নীতি।" />
      <div className="max-w-[800px] mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: "গোপনীয়তা নীতি" }]} />
        <h1 className="text-2xl font-bold text-foreground mb-6">গোপনীয়তা নীতি (Privacy Policy)</h1>
        <div className="prose prose-sm max-w-none text-foreground/80 space-y-5">
          <section>
            <h2 className="text-lg font-semibold text-foreground">১. তথ্য সংগ্রহ</h2>
            <p>{siteName} ব্যবহারকারীদের নিম্নলিখিত তথ্য সংগ্রহ করতে পারে: নাম, ইমেইল, ফোন নম্বর, ঠিকানা এবং ডিভাইস সম্পর্কিত তথ্য।</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">২. তথ্য ব্যবহার</h2>
            <p>সংগৃহীত তথ্য নিম্নলিখিত উদ্দেশ্যে ব্যবহৃত হয়:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>সেবা প্রদান ও উন্নতি</li>
              <li>অর্ডার প্রক্রিয়াকরণ ও ডেলিভারি</li>
              <li>নোটিফিকেশন ও আপডেট পাঠানো</li>
              <li>শিক্ষার্থী ও শিক্ষক তথ্য ব্যবস্থাপনা</li>
              <li>পরীক্ষার ফলাফল প্রকাশ</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">৩. তথ্য সুরক্ষা</h2>
            <p>আমরা আপনার ব্যক্তিগত তথ্যের নিরাপত্তা নিশ্চিত করতে যথাযথ প্রযুক্তিগত ও প্রশাসনিক ব্যবস্থা গ্রহণ করি। তবে, ইন্টারনেটে কোনো তথ্য স্থানান্তর সম্পূর্ণ নিরাপদ নয়।</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">৪. তৃতীয় পক্ষ</h2>
            <p>আইনগত বাধ্যবাধকতা ব্যতীত আমরা আপনার ব্যক্তিগত তথ্য কোনো তৃতীয় পক্ষের সাথে শেয়ার করি না।</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">৫. কুকিজ</h2>
            <p>আমাদের ওয়েবসাইট ব্যবহারকারীর অভিজ্ঞতা উন্নত করতে কুকিজ ব্যবহার করে। আপনি ব্রাউজার সেটিংসের মাধ্যমে কুকিজ নিষ্ক্রিয় করতে পারেন।</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">৬. পুশ নোটিফিকেশন</h2>
            <p>আমাদের অ্যাপ ও ওয়েবসাইট পুশ নোটিফিকেশন পাঠাতে পারে। আপনি যেকোনো সময় এটি বন্ধ করতে পারেন।</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">৭. নীতি পরিবর্তন</h2>
            <p>এই গোপনীয়তা নীতি যেকোনো সময় আপডেট করা হতে পারে। পরিবর্তন হলে ওয়েবসাইটে জানানো হবে।</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground">৮. যোগাযোগ</h2>
            <p>গোপনীয়তা সম্পর্কে কোনো প্রশ্ন থাকলে আমাদের যোগাযোগ পেজের মাধ্যমে জানাতে পারেন।</p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPage;
