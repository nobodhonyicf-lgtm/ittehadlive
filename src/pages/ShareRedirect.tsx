import { useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";

const ShareRedirect = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { type, id, slug, category } = params as Record<string, string | undefined>;
  const cat = category || searchParams.get("category");

  useEffect(() => {
    let target = "/";
    if (type === "teacher" && id) target = `/teachers?highlight=${id}`;
    else if (type === "job" && id) target = `/job-apply/${id}`;
    else if (type === "post" && (slug || id)) target = `/post/${slug || id}`;
    else if (type === "page" && (slug || id)) target = `/page/${slug || id}`;
    else if (type === "notice" && id) target = `/notice/${id}`;
    else if (type === "book" && (slug || id)) target = `/book/${slug || id}`;
    else if (type === "branch" && id) target = `/branch/${id}`;
    else if (type === "islamic" && id) target = `/${cat || "hadith"}?highlight=${id}`;
    navigate(target, { replace: true });
  }, [type, id, slug, category, cat, navigate]);

  return null;
};

export default ShareRedirect;
