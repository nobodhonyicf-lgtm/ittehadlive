GRANT EXECUTE ON FUNCTION public.get_or_create_certificate_by_roll_reg(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_missing_certificates() TO authenticated;