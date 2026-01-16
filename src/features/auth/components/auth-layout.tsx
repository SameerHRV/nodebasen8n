import Image from "next/image";
import Link from "next/link";

const AuthLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <div className="bg-muted flex items-center justify-center min-h-svh flex-col gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href={"/"}
          className="flex items-center gap-2 self-center font-medium"
        >
          <Image src={"/logo.svg"} alt="Nodebase" width={30} height={30} />
          <span>Nodebase</span>
        </Link>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
