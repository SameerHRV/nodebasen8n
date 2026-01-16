import AuthLayout from "@/features/auth/components/auth-layout";

const Layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return <AuthLayout>{children}</AuthLayout>;
};

export default Layout;
